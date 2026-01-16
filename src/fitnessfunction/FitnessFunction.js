/** @typedef {import('../core/genome/Genome')} Genome */

/**
 * Abstract base class for fitness functions used to evaluate genome performance.
 * Subclasses must implement the {@link FitnessFunction#calculateFitness} method.
 * @abstract
 */
class FitnessFunction {
  /**
   * Calculates the fitness score for a given genome.
   * @param {Genome} genome - The genome to evaluate.
   * @returns {number} The fitness score of the genome.
   * @throws {Error} If not implemented by a subclass.
   * @abstract
   */
  calculateFitness(genome) {
    throw new Error("calculateFitness(genome) must be implemented by subclass");
  }
}

module.exports = FitnessFunction;
