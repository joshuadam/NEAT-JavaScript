/**
 * Tracks and assigns unique genome IDs within a population.
 * Each population has its own GenomeTracker instance to ensure unique genome identification.
 */
export class GenomeTracker {
  private genomeId = 0;

  /**
   * Gets the next available genome ID and increments the counter.
   * @returns The next unique genome ID.
   */
  getNextGenomeId(): number {
    return this.genomeId++;
  }
}
