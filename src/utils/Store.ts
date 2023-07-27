export default class Store {

  #type: 'session' | 'persistent';
  #storage: Storage;
  #cachedValues: Record<string, any>;

  constructor(type: 'session' | 'persistent' = 'session') {
    this.#type = type;
    if (type === 'session') {
      this.#storage = sessionStorage;
    }
    else {
      this.#storage = localStorage;
    }
    this.#cachedValues = {};
    for (const [ key, value ] of Object.entries(this.#storage)) {
      this.#cachedValues[key] = JSON.parse(value);
    }
  }

  getType() {
    return this.#type;
  }

  set<T>(key: string, value?: T) {
    if (value === undefined) {
      this.#storage.removeItem(key);
    }
    else {
      this.#storage.setItem(key, JSON.stringify(value));
    }
    this.#cachedValues[key] = value;
  }

  get<T>(key: string, defaultValue: T, setIfNotExists: boolean): T;
  get<T>(key: string, defaultValue?: undefined, setIfNotExists?: boolean): T | undefined;
  get<T>(key: string, defaultValue?: T, setIfNotExists = false): T | undefined {
    if (Object.keys(this.#cachedValues).includes(key)) {
      return this.#cachedValues[key];
    }

    if (this.keyExists(key)) {
      const rawValue = this.#storage.getItem(key);
      if (rawValue) {
        const parsedValue = JSON.parse(rawValue);
        this.#cachedValues[key] = parsedValue;
        return parsedValue;
      }
    }

    if (setIfNotExists) {
      this.set(key, defaultValue);
    }

    return defaultValue;
  }

  delete(key: string) {
    this.#storage.removeItem(key);
    delete this.#cachedValues[key];
  }

  getKeys() {
    return Object.keys(this.#storage);
  }

  keyExists(key: string) {
    return this.getKeys().includes(key);
  }

  clear() {
    this.#storage.clear();
  }
}
