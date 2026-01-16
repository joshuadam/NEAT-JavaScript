/**
 * Tracks and assigns unique genome IDs within a population.
 * Each population has its own GenomeTracker instance to ensure unique genome identification.
 */
class GenomeTracker {
  /**
   * Creates a new GenomeTracker instance.
   * Initializes the genome ID counter to 0.
   */
  constructor() {
    /** @type {number} */
    this.genomeId = 0;
  }

  /**
   * Gets the next available genome ID and increments the counter.
   * @returns {number} The next unique genome ID.
   */
  getNextGenomeId() {
    return this.genomeId++;
  }
}

module.exports = GenomeTracker;
