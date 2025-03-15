class ConfigTracker {
  static #configId = 0;

  static getNextConfigId() {
    return this.#configId++;
  }
}

module.exports = ConfigTracker;