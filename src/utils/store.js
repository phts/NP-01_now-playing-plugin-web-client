export default class Store {
  constructor() {
    this.entries = {};
  }

  set(key, value) {
    this.entries[key] = value;
  }

  get(key, defaultValue = undefined, setIfNotExists = false) {
    if (this.entries[key] !== undefined) {
      return this.entries[key];
    }
    if (setIfNotExists) {
      this.set(key, defaultValue);
    }
    return defaultValue;
  }
  
  delete(key) {
    delete this.entries[key];
  }
  
  getKeys() {
    return Object.keys(this.entries);
  }
  
  clear() {
    this.entries = {};
  }  
}
