import EventEmitter from "eventemitter3";
import { isHome } from "../screens/browse/helper";

const HOME = {
  type: 'browse',
  uri: '',
  service: null
};

export default class BrowseService {
  constructor(socket, host) {
    this.socket = socket;
    this.host = host;
    this.init();
  }

  init() {
    this.emitter = new EventEmitter();
    this.currentDisplayed = {
      location: HOME,
      contents: null
    };
    this._setBrowseSources([]);
    if (this.socket) {
      this.socketEventHandlers = {
        'pushBrowseSources': this._setBrowseSources.bind(this),
        'pushBrowseLibrary': this._handlePushBrowseLibrary.bind(this),
        'pushAddWebRadio': this._handlePushAddWebRadio.bind(this)
      }
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        this.socket.on(event, handler);
      }
      this.socket.emit('getBrowseSources');
    }
    this.currentLoading = null;
    this.lastAction = null;
    this.backHistory = [];
    this.currentSearchQuery = null;
  }

  destroy() {
    if (this.socket && this.socketEventHandlers) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        this.socket.off(event, handler);
      }
    }
    this.socket = null;
    this.socketEventHandlers = null;
    this._setBrowseSources([]);
    this.emitter.removeAllListeners();
    this.emitter = null;
    this.currentDisplayed = null;
    this.currentLoading = null; // location
    this.lastAction = null;
    this.backHistory = [];
    this.currentSearchQuery = null;
  }

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
    if (isHome(this.currentDisplayed.location)) {
      this.browse(HOME);
    }
  }

  getBrowseSources() {
    return this.browseSources;
  }

  _handlePushBrowseLibrary(data) {
    // Only handle certain cases.
    // For browsing library we use REST API
    // -- Search results
    if (data.navigation && data.navigation.isSearchResult) {
      this._pushSearchResults(data);
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

  _pushLoad(location, contents, scrollPosition = 0, isBack = false) {
    this.currentLoading = null;
    this.emitter.emit('contentsLoaded', {location, contents, scrollPosition, isBack});
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

  _pushSearchResults(data) {
    const loading = this.currentLoading;
    if (!loading || loading.type !== 'search' || loading.query !== this.currentSearchQuery) {
      return;
    }
    if (data.navigation) {
      this.currentLoading = null;
      this._pushLoad(loading, data);
    }
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
      this._pushLoad(
        HOME, {
        navigation: {
          lists: [{
            items: this.getBrowseSources(),
            availableListViews: ['grid']
          }]
        }
      });
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

  search(query) {
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
    if (this.currentDisplayed) {
      const service = this.currentDisplayed.location.service;
      if (service) {
        payload.service = service.name;
        searchLocation.service = service;
      }
    }
    this.currentSearchQuery = query;
    this.currentLoading = searchLocation;
    this._pushLoading(searchLocation);
    this.socket.emit('search', payload);
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
    else if (prev.location.type === 'browse' || prev.location.type === 'search') {
      this._pushLoad(prev.location, prev.contents, prev.scrollPosition, true);
    }
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
}
