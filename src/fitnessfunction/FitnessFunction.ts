import type { Genome } from '../core/genome/Genome';

/**
 * Abstract base class for fitness functions used to evaluate genome performance.
 * Subclasses must implement the {@link FitnessFunction#calculateFitness} method.
 *
 * The class is intentionally free of private members so any object with a
 * structurally compatible `calculateFitness` method is accepted wherever a
 * `FitnessFunction` is expected.
 */
export abstract class FitnessFunction {
  /**
   * Calculates the fitness score for a given genome.
   * @param genome - The genome to evaluate.
   * @returns The fitness score of the genome.
   */
  abstract calculateFitness(genome: Genome): number;
}
