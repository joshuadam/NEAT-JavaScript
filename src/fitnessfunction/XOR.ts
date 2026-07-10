import { FitnessFunction } from './FitnessFunction';
import type { Genome } from '../core/genome/Genome';

/**
 * Evaluates fitness based on the XOR problem (built-in test case)
 */
export class XOR extends FitnessFunction {
  /**
   * Calculates the fitness of a genome based on its performance on the XOR problem.
   * The fitness is computed as 1 / (1 + squared_error), where squared_error is the
   * sum of squared differences between expected and actual outputs.
   * @param genome - The genome to evaluate.
   * @returns A fitness value in the range (0, 1], where 1 is a perfect solution.
   */
  calculateFitness(genome: Genome): number {
    const inputs = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ] as const;
    const expectedOutputs = [0, 1, 1, 0] as const;
    let error = 0;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const output = genome.propagate(input);
      error += Math.pow(output[0] - expectedOutputs[i], 2);
    }
    return 1.0 / (1.0 + error);
  }
}
