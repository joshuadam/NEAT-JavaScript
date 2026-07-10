/**
 * Static utility class for tracking configuration IDs.
 * Provides unique identifiers for configuration instances.
 */
export class ConfigTracker {
  static #configId = 0;

  /**
   * Gets the next available configuration ID and increments the counter.
   * @returns The next unique configuration ID.
   */
  static getNextConfigId(): number {
    return this.#configId++;
  }
}
