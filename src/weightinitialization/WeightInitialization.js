class WeightInitialization {
  initializeWeight() {
    throw new Error("initializeWeight() must be implemented by subclass");
  }

  initializeWeights(size) {
    throw new Error("initializeWeights() must be implemented by subclass");
  }
}

module.exports = WeightInitialization;