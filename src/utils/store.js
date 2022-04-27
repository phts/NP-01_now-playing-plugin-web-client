export default class Store {
  constructor(type = 'session') {
    this.type = type;
    if (type === 'session') {
      this.storage = sessionStorage;
    }
    else {
      this.storage = localStorage;
    }
    this.cachedValues = {};
    for (const [key, value] of Object.entries(this.storage)) {
      this.cachedValues[key] = JSON.parse(value);
    }
  }

  getType() {
    return this.type;
  }

  set(key, value) {
    if (value === undefined) {
      this.storage.removeItem(key);
    }
    else {
      this.storage.setItem(key, JSON.stringify(value));
    }
    this.cachedValues[key] = value;
  }

  get(key, defaultValue = undefined, setIfNotExists = false) {
    if (Object.keys(this.cachedValues).includes(key)) {
      return this.cachedValues[key];
    }
    
    if (this.keyExists(key)) {
      const rawValue = this.storage.getItem(key);
      const parsedValue = JSON.parse(rawValue);
      this.cachedValues[key] = parsedValue;
      return parsedValue;
    }
    
    if (setIfNotExists) {
      this.set(key, defaultValue);
    }

    return defaultValue;
  }
  
  delete(key) {
    delete this.storage.removeItem(key);
  }
  
  getKeys() {
    return Object.keys(this.storage);
  }

  keyExists(key) {
    return this.getKeys().includes(key);
  }
  
  clear() {
    this.storage.clear();
  }  
}
