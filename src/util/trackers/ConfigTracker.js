/**
 * Static utility class for tracking configuration IDs.
 * Provides unique identifiers for configuration instances.
 */
class ConfigTracker {
  static #configId = 0;

  /**
   * Gets the next available configuration ID and increments the counter.
   * @returns {number} The next unique configuration ID.
   */
  static getNextConfigId() {
    return this.#configId++;
  }
}

module.exports = ConfigTracker;
