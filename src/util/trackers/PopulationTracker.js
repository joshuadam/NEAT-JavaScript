/**
 * Static tracker for generating unique population IDs.
 * Ensures each population in the system has a unique identifier.
 */
class PopulationTracker {
  static #populationId = 0;

  /**
   * Gets the next unique population ID.
   * Each call increments the internal counter and returns a new ID.
   * @returns {number} A unique population identifier.
   */
  static getNextPopulationId() {
    return this.#populationId++;
  }
}

module.exports = PopulationTracker;