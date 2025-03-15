const FitnessFunction = require('./FitnessFunction');

class XOR extends FitnessFunction {
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