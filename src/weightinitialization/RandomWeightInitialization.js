const WeightInitialization = require('./WeightInitialization');

class RandomWeightInitialization extends WeightInitialization {
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }

  initializeWeight() {
    return this.min + (this.max - this.min) * Math.random();
  }

  initializeWeights(size) {
    const weights = [];
    for (let i = 0; i < size; i++) {
      weights.push(this.initializeWeight());
    }
    return weights;
  }
}

module.exports = RandomWeightInitialization;