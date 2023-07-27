import EventEmitter from 'events';
import { getServiceByName, isHome } from '../screens/browse/helper';
import { PlayerState } from '../contexts/player/PlayerStateProvider';

export interface BrowseSourceService {
  name?: string;
  prettyName?: string;
}

export interface LocationBase {
  type: string;
  service: BrowseSourceService | null;
}

export interface BrowseLocation extends LocationBase {
  type: 'browse';
  uri: string;
  browseItem?: BrowseContentsListItem;
}

export interface SearchLocation extends LocationBase {
  type: 'search';
  query: string;
}

export interface GotoLocation extends LocationBase {
  type: 'goto';
  params: {
    type: 'album' | 'artist';
    playerState: PlayerState;
  };
}

export interface BrowseAction {
  action: string;
  expectsContentsRefresh: boolean;
  originatingLocation: BrowseServiceLocation | null;
}

export type BrowseServiceLocation = BrowseLocation | SearchLocation | GotoLocation;

export interface BrowseServiceContentsLoaderContext {
  location: BrowseServiceLocation;
  scrollPosition: number;
  isBack: boolean;
  isRestore: boolean;
}

export interface BrowseContentsListItem {
  service?: string;
  type?: string;
  title?: string;
  albumart?: string | null;
  artist?: string | null;
  album?: string | null;
  duration?: number | null;
  uri?: string;
  icon?: string;
  tracknumber?: number;
  number?: number;
  favourite?: boolean;
  disablePlayButton?: boolean;
}

export interface BrowseContentsHeader {
  service?: string;
  type?: string;
  uri?: string;
  title?: string;
  albumart?: string | null;
  album?: string | null;
  artist?: string | null;
  year?: number | string | null;
  duration?: string | null;
  genre?: string | null;
  trackType?: string;
}

export interface BrowseContentsList {
  title?: string;
  availableListViews?: ('list' | 'grid')[];
  items?: BrowseContentsListItem[] | BrowseSource[];
}

export interface BrowseContentsPage {
  navigation?: {
    prev?: {
      uri?: string;
    };
    info?: BrowseContentsHeader;
    lists?: BrowseContentsList[];
    isSearchResult?: boolean;
  };
  error?: any;
}

export interface BrowseSource {
  name?: string;
  plugin_name?: string;
  plugin_type?: string;
  uri?: string;
  albumart?: string;
}

const HOME: BrowseLocation = {
  type: 'browse',
  uri: '',
  service: null
};

export default class BrowseService extends EventEmitter {

  // Primordial version of socket.io client does not have typing
  #socket: SocketIOClient.Socket | null;
  #host: string | null;
  #hasReset: boolean;
  #currentDisplayed!: {
    location: BrowseServiceLocation;
    contents: any;
  };
  #currentLoading!: BrowseServiceLocation | null;
  #lastAction!: BrowseAction | null;
  #backHistory!: {
    location: BrowseServiceLocation;
    contents: any;
    scrollPosition: number;
  }[];
  #socketEventHandlers!: {
    connect: () => void;
    reconnect: () => void;
    pushBrowseSources: (data: BrowseSource[]) => void;
    pushBrowseLibrary: (data: BrowseContentsPage) => void;
    pushAddWebRadio: (result: { success: boolean }) => void;
  };
  #browseSources!: BrowseSource[];

  constructor() {
    super();
    this.#socket = null;
    this.#host = null;
    this.#hasReset = false;
    this.#initState();
    this.#initSocketEventHandlers();
  }

  #initState() {
    this.#currentDisplayed = {
      location: HOME,
      contents: null
    };
    this.#setBrowseSources([]);
    this.#currentLoading = null;
    this.#lastAction = null;
    this.#backHistory = [];
  }

  #initSocketEventHandlers() {
    this.#socketEventHandlers = {
      'connect': this.#handleSocketConnnect.bind(this),
      'reconnect': this.#handleSocketConnnect.bind(this),
      'pushBrowseSources': this.#setBrowseSources.bind(this),
      'pushBrowseLibrary': this.#handlePushBrowseLibrary.bind(this),
      'pushAddWebRadio': this.#handlePushAddWebRadio.bind(this)
    };
  }

  setSocket(socket: SocketIOClient.Socket | null) {
    const oldSocket = this.#socket;
    if (oldSocket === socket) {
      return;
    }
    if (oldSocket) {
      for (const [ event, handler ] of Object.entries(this.#socketEventHandlers)) {
        oldSocket.off(event, handler);
      }
    }
    this.#socket = socket;
    if (this.#socket) {
      for (const [ event, handler ] of Object.entries(this.#socketEventHandlers)) {
        this.#socket.on(event, handler);
      }

      this.#host = this.#socket.io.uri;

      // Reset the browsing state
      this.#initState();
      this.#hasReset = true;

      if (this.#socket.connected) {
        // Request browse sources
        this.#socket.emit('getBrowseSources');
      }

    }
    else {
      this.#host = null;
    }
  }

  isReady() {
    return this.#socket && this.#socket.connected && this.#host;
  }

  #handleSocketConnnect() {
    if (this.#socket) {
      this.#socket.emit('getBrowseSources');
    }
  }

  compareLocations(l1: BrowseLocation, l2: BrowseLocation) {
    return l1 && l2 &&
      (l1.uri === l2.uri || (isHome(l1) && isHome(l2)));
  }

  #setBrowseSources(data: BrowseSource[]) {
    this.#browseSources = data;
    if (this.#currentDisplayed && isHome(this.#currentDisplayed.location)) {
      const contents = this.#getBrowseSourceContents();
      this.#pushRefresh(contents);
    }
  }

  getBrowseSources() {
    return this.#browseSources;
  }

  #getBrowseSourceContents(): BrowseContentsPage {
    return {
      navigation: {
        lists: [ {
          items: this.getBrowseSources(),
          availableListViews: [ 'grid' ]
        } ]
      }
    };
  }

  #handlePushBrowseLibrary(data: BrowseContentsPage) {
    // Only handle certain cases.
    // For browsing library we use REST API
    // We try to avoid using sockets for sending requests and receiving responses,
    // Because with Volumio's implementation there is no way to associate a response with
    // A request. For example, we could be sending multiple search requests due to the
    // 'search-as-you-type' feature. There is no guarantee that the responses will be
    // Received in the order they were sent and we have no way of finding out of which
    // Response is to which request. If the responses arrive out of order, then the search
    // Results will not be accurate and there is nothing we can do about it.

    // -- Search results
    if (data.navigation && data.navigation.isSearchResult &&
      this.#currentLoading && this.#currentLoading.type === 'search') {
      this.#pushLoad(this.#currentLoading, data);
    }
    // -- 'Goto' results
    else if (this.#currentLoading && this.#currentLoading.type === 'goto') {
      if (data.error) {
        this.#pushError(data.error);
      }
      else {
        this.#pushLoad(this.#currentLoading, data);
      }
    }
    // -- Previously performed action that expects a pushBrowseLibrary
    // Response (and current location has not changed)
    // * Call registerAction() to set previously performed action
    else if (this.#lastAction && this.#currentDisplayed &&
      this.#currentDisplayed.location.type === 'browse' &&
      this.#lastAction.originatingLocation?.type === 'browse' &&
      this.#lastAction.expectsContentsRefresh &&
      this.compareLocations(this.#lastAction.originatingLocation, this.#currentDisplayed.location)) {
      this.#lastAction = null;
      this.#pushRefresh(data);
    }
  }

  #handlePushAddWebRadio(result: { success: boolean; }) {
    if (result.success && this.#currentDisplayed.location.type === 'browse' && this.#currentDisplayed.location.uri === 'radio/myWebRadio') {
      this.browse(this.#currentDisplayed.location, true);
    }
  }

  #pushLoad(location: BrowseServiceLocation, contents: BrowseContentsPage, scrollPosition = 0, loadType?: 'back' | 'restore') {
    this.#currentLoading = null;
    const context: BrowseServiceContentsLoaderContext = {
      location,
      scrollPosition,
      isBack: loadType === 'back',
      isRestore: loadType === 'restore'
    };
    const payload = {
      contents,
      context
    };
    this.emit('contentsLoaded', payload);
    this.#currentDisplayed = { location, contents };
    if (isHome(location)) {
      this.#backHistory = [];
    }
  }

  #pushRefresh(contents: BrowseContentsPage) {
    this.#currentLoading = null;
    this.emit('contentsRefreshed', { contents });
    this.#currentDisplayed.contents = contents;
  }

  #pushError(message: string) {
    this.#currentLoading = null;
    this.emit('error', { message });
  }

  #pushLoading(location?: BrowseServiceLocation) {
    this.emit('contentsLoading', { location });
  }

  async #requestRestApi(url: string) {
    const res = await fetch(url);
    return await res.json();
  }

  browse(location: BrowseLocation, refresh = false) {
    if (location.type !== 'browse') {
      return;
    }
    this.#pushLoading(location);
    if (isHome(location)) {
      this.#backHistory = [];
      // Push browse sources
      this.#pushLoad(HOME, this.#getBrowseSourceContents());
    }
    else {
      this.#currentLoading = location;
      const requestUrl = `${this.#host}/api/v1/browse?uri=${encodeURIComponent(encodeURIComponent(location.uri))}`;
      this.#requestRestApi(requestUrl).then((data) => {
        if (this.#currentLoading && this.#currentLoading.type === 'browse' && this.compareLocations(this.#currentLoading, location)) {
          if (data.error) {
            this.#pushError(data.error);
          }
          else if (refresh) {
            this.#pushRefresh(data);
          }
          else {
            this.#pushLoad(location, data);
          }
        }
      });
    }
  }

  // There is a difference between service = null and service = undefined:
  // - null: search all services
  // - undefined: search service as provided by currentDisplayed
  search(query: string, service?: BrowseServiceLocation['service']) {
    if (!this.#socket) {
      return;
    }
    // Volumio REST API for search does NOT have the same implementation as Websocket API!
    // Must use Websocket because REST API does not allow for source-specific searching.
    const payload: { value: string; service?: string } = {
      value: query
      // In Volumio musiclibrary.js, the payload also has a 'uri' field - what is it used for???
    };
    const searchLocation: SearchLocation = {
      type: 'search',
      query,
      service: null
    };
    const _service = service || (this.#currentDisplayed ? this.#currentDisplayed.location.service : null);
    if (_service) {
      payload.service = _service.name;
      searchLocation.service = _service;
    }
    this.#currentLoading = searchLocation;
    this.#pushLoading(searchLocation);
    this.#socket.emit('search', payload);
  }

  resetContents() {
    this.#backHistory = [];
    this.#pushLoad(HOME, {});
  }

  /**
   * Data: {
   *  location
   *  contents
   *  scrollPosition
   * }
   */
  addCurrentToHistory(scrollPosition: number) {
    if (!isHome(this.#currentDisplayed.location)) {
      this.#backHistory.push({
        ...this.#currentDisplayed,
        scrollPosition
      });
    }
  }

  goBack() {
    this.#pushLoading();
    const prev = this.#backHistory.pop();
    if (!prev || isHome(prev.location)) {
      this.browse(HOME);
    }
    else if ([ 'browse', 'search', 'goto' ].includes(prev.location.type)) {
      this.#pushLoad(prev.location, prev.contents, prev.scrollPosition, 'back');
    }
  }

  gotoCurrentPlaying(type: 'album' | 'artist', playerState: PlayerState) {
    if (!this.#socket) {
      return;
    }
    this.resetContents();
    const payload = {
      type,
      value: playerState[type],
      artist: playerState.artist,
      album: playerState.album
    };
    const gotoLocation: GotoLocation = {
      type: 'goto',
      params: {
        type,
        playerState: { ...playerState }
      },
      service: getServiceByName(playerState.service, this.getBrowseSources())
    };
    this.#currentLoading = gotoLocation;
    this.#pushLoading();
    this.#socket.emit('goTo', payload);
  }

  /**
   * Action {
   *  action,
   *  expectsContentsRefresh
   *  originatingLocation
   * }
   */
  registerAction(action: BrowseAction | null) {
    this.#lastAction = action;
  }

  restoreCurrentDisplayed(scrollPosition: number) {
    if (this.#currentDisplayed) {
      this.#pushLoad(this.#currentDisplayed.location, this.#currentDisplayed.contents, this.#hasReset ? 0 : scrollPosition, 'restore');
    }
    this.#hasReset = false;
  }


  on(event: 'error', listener: (data: { message: any }) => void): this;
  on(event: 'contentsLoading', listener: (data: { location: BrowseServiceLocation }) => void): this;
  on(event: 'contentsRefreshed', listener: (data: { contents: BrowseContentsPage }) => void): this;
  on(event: 'contentsLoaded', listener: (data: { contents: BrowseContentsPage; context: BrowseServiceContentsLoaderContext; }) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
