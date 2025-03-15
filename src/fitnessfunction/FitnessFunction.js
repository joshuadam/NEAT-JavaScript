class FitnessFunction {
  calculateFitness(genome) {
    throw new Error("calculateFitness(genome) must be implemented by subclass");
  }
}

module.exports = FitnessFunction;