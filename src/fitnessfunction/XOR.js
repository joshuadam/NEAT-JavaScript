const FitnessFunction = require('./FitnessFunction');

/** @typedef {import('../core/genome/Genome')} Genome */

/**
 * Evaluates fitness based on the XOR problem (built-in test case)
 * @extends FitnessFunction
 */
class XOR extends FitnessFunction {
  /**
   * Calculates the fitness of a genome based on its performance on the XOR problem.
   * The fitness is computed as 1 / (1 + squared_error), where squared_error is the
   * sum of squared differences between expected and actual outputs.
   * @param {Genome} genome - The genome to evaluate.
   * @returns {number} A fitness value in the range (0, 1], where 1 is a perfect solution.
   */
  calculateFitness(genome) {
    const inputs = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ];
    const expectedOutputs = [0, 1, 1, 0];
    let error = 0;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const output = genome.propagate(input);
      error += Math.pow(output[0] - expectedOutputs[i], 2);
    }
    return 1.0 / (1.0 + error);
  }
}

module.exports = XOR;
