import EventEmitter from "eventemitter3";
import { getServiceByName, isHome } from "../screens/browse/helper";

const HOME = {
  type: 'browse',
  uri: '',
  service: null
};

export default class BrowseService {
  constructor() {
    this.socket = null;
    this.host = null;
    this.hasReset = false;
    this.emitter = new EventEmitter();
    this.initState();
    this.initSocketEventHandlers();
  }

  initState() {
    this.currentDisplayed = {
      location: HOME,
      contents: null
    };
    this._setBrowseSources([]);
    this.currentLoading = null;
    this.lastAction = null;
    this.backHistory = [];
  }

  initSocketEventHandlers() {
    this.socketEventHandlers = {
      'pushBrowseSources': this._setBrowseSources.bind(this),
      'pushBrowseLibrary': this._handlePushBrowseLibrary.bind(this),
      'pushAddWebRadio': this._handlePushAddWebRadio.bind(this)
    };
  }

  setSocket(socket) {
    const oldSocket = this.socket;
    if (oldSocket === socket) {
      return;
    }
    if (oldSocket) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        oldSocket.off(event, handler);
      }
    }
    this.socket = socket;
    if (this.socket) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        this.socket.on(event, handler);
      }

      this.host = this.socket.io.uri;

      // Reset the browsing state
      this.initState();
      this.hasReset = true;

      // Request browse sources
      this.socket.emit('getBrowseSources');

    }
    else {
      this.host = null;
    }
  }

  isReady() {
    return this.socket && this.socket.connected && this.host;
  }

  /*destroy() {
    if (this.socket && this.socketEventHandlers) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        this.socket.off(event, handler);
      }
    }
    this.socket = null;
    this.socketEventHandlers = null;
    this._setBrowseSources([]);
    this.emitter.removeAllListeners();
    //this.emitter = null; <-- commenting out for react refresh to work
    this.currentDisplayed = null;
    this.currentLoading = null; // location
    this.lastAction = null;
    this.backHistory = [];
  }*/

  // Event:
  // contentsLoaded
  // contentsRefreshed
  // error
  on(event, handler) {
    this.emitter.on(event, handler);
  }

  off(event, handler) {
    this.emitter.off(event, handler);
  }

  compareLocations(l1, l2) {
    return l1 && l2 &&
      (l1.uri === l2.uri || (isHome(l1) && isHome(l2)));
  }

  _setBrowseSources(data) {
    this.browseSources = data;
    if (this.currentDisplayed && isHome(this.currentDisplayed.location)) {
      const contents = this._getBrowseSourceContents();
      this._pushRefresh(contents);
    }
  }

  getBrowseSources() {
    return this.browseSources;
  }

  _getBrowseSourceContents() {
    return {
      navigation: {
        lists: [{
          items: this.getBrowseSources(),
          availableListViews: ['grid']
        }]
      }
    };
  }

  _handlePushBrowseLibrary(data) {
    // Only handle certain cases.
    // For browsing library we use REST API
    // We try to avoid using sockets for sending requests and receiving responses,
    // because with Volumio's implementation there is no way to associate a response with
    // a request. For example, we could be sending multiple search requests due to the 
    // 'search-as-you-type' feature. There is no guarantee that the responses will be 
    // received in the order they were sent and we have no way of finding out of which 
    // response is to which request. If the responses arrive out of order, then the search
    // results will not be accurate and there is nothing we can do about it.

    // -- Search results
    if (data.navigation && data.navigation.isSearchResult && 
      this.currentLoading && this.currentLoading.type === 'search') {
        this._pushLoad(this.currentLoading, data);
    }
    // -- 'Goto' results
    else if (this.currentLoading && this.currentLoading.type === 'goto') {
      if (data.error) {
        this._pushError(data.error);
      }
      else {
        this._pushLoad(this.currentLoading, data);
      }
    }
    // -- Previously performed action that expects a pushBrowseLibrary 
    // response (and current location has not changed)
    // * Call registerAction() to set previously performed action
    else if (this.lastAction && this.currentDisplayed &&
      this.lastAction.expectsContentsRefresh &&
      this.compareLocations(this.lastAction.originatingLocation, this.currentDisplayed.location)) {
        this.lastAction = null;
        this._pushRefresh(data);
    }
  }

  _handlePushAddWebRadio(result) {
    if (result.success && this.currentDisplayed && this.currentDisplayed.location.uri === 'radio/myWebRadio') {
      this.browse(this.currentDisplayed.location, true);
    }
  }

  _pushLoad(location, contents, scrollPosition = 0, loadType) {
    this.currentLoading = null;
    const payload = {location, contents, scrollPosition};
    if (loadType === 'back') {
      payload.isBack = true;
    }
    if (loadType === 'restore') {
      payload.isRestore = true;
    }
    this.emitter.emit('contentsLoaded', payload);
    this.currentDisplayed = { location, contents };
    if (isHome(location)) {
      this.backHistory = [];
    }
  }

  _pushRefresh(contents) {
    this.currentLoading = null;
    this.emitter.emit('contentsRefreshed', {contents});
    this.currentDisplayed.contents = contents;
  }

  _pushError(message) {
    this.currentLoading = null;
    this.emitter.emit('error', {message})
  }

  _pushLoading(location) {
    this.emitter.emit('contentsLoading', {location});
  }

  _requestRestApi(url) {
    return fetch(url).then(res => res.json());
  };

  browse(location, refresh = false) {
    if (location.type !== 'browse') {
      return;
    }
    this._pushLoading(location);
    if (isHome(location)) {
      this.backHistory = [];
      // Push browse sources
      this._pushLoad(HOME, this._getBrowseSourceContents());
    }
    else {
      this.currentLoading = location;
      let requestUrl = `${this.host}/api/v1/browse?uri=${encodeURIComponent(encodeURIComponent(location.uri))}`;
      this._requestRestApi(requestUrl).then((data) => {
        if (this.currentLoading && this.currentLoading.type === 'browse' && this.compareLocations(this.currentLoading, location)) {
          if (data.error) {
            this._pushError(data.error);
          }
          else if (refresh) {
            this._pushRefresh(data);
          }
          else {
            this._pushLoad(location, data);
          }
        }
      });
    }
  }

  // There is a difference between service = null and service = undefined:
  // - null: search all services
  // - undefined: search service as provided by currentDisplayed
  search(query, service) {
    if (!this.socket) {
      return;
    }
    // Volumio REST API for search does NOT have the same implementation as Websocket API!
    // Must use Websocket because REST API does not allow for source-specific searching.
    const payload = {
      value: query
      // In Volumio musiclibrary.js, the payload also has a 'uri' field - what is it used for???
    }
    const searchLocation = {
      type: 'search',
      query,
      service: null
    };
    const _service = service !== undefined ? service : (this.currentDisplayed ? this.currentDisplayed.location.service : null);
    if (_service) {
      payload.service = _service.name;
      searchLocation.service = _service;
    }
    this.currentLoading = searchLocation;
    this._pushLoading(searchLocation);
    this.socket.emit('search', payload);
  }

  resetContents() {
    this.backHistory = [];
    this._pushLoad(HOME, {});
  }

  /**
   * data: {
   *  location
   *  contents
   *  scrollPosition
   * }
   */
  addCurrentToHistory(scrollPosition) {
    if (!isHome(this.currentDisplayed.location)) {
      this.backHistory.push({
        ...this.currentDisplayed,
        scrollPosition
      });
    }
  }

  goBack() {
    this._pushLoading();
    const prev = this.backHistory.pop();
    if (!prev || isHome(prev.location)) {
      this.browse(HOME);
    }
    else if (['browse', 'search', 'goto'].includes(prev.location.type)) {
      this._pushLoad(prev.location, prev.contents, prev.scrollPosition, 'back');
    }
  }

  gotoCurrentPlaying(type, playerState) {
    if (!this.socket) {
      return;
    }
    this.resetContents();
    const payload = {
      type,
      value: playerState[type],
      artist: playerState.artist,
      album: playerState.album
    };
    const gotoLocation = {
      type: 'goto',
      params: payload,
      service: getServiceByName(playerState.service, this.getBrowseSources())
    };
    this.currentLoading = gotoLocation;
    this._pushLoading();
    this.socket.emit('goTo', payload);
  }

  /**
   * action {
   *  action,
   *  expectsContentsRefresh
   *  originatingLocation
   * }
   */
  registerAction(action) {
    this.lastAction = action;
  }

  restoreCurrentDisplayed(scrollPosition) {
    if (this.currentDisplayed) {
      this._pushLoad(this.currentDisplayed.location, this.currentDisplayed.contents, this.hasReset ? null : scrollPosition, 'restore');
    }
    this.hasReset = false;
  }
}
