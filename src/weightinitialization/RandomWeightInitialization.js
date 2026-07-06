const WeightInitialization = require('./WeightInitialization');

/**
 * Random weight initialization strategy.
 * Initializes weights with random values uniformly distributed within a specified range.
 * @extends WeightInitialization
 */
class RandomWeightInitialization extends WeightInitialization {
  /**
   * Creates a new RandomWeightInitialization instance.
   * @param {number} min - The minimum value for random weights (inclusive).
   * @param {number} max - The maximum value for random weights (exclusive).
   */
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }

  /**
   * Initializes a single weight with a random value within the configured range.
   * @returns {number} A random weight value between min and max.
   */
  initializeWeight() {
    return this.min + (this.max - this.min) * Math.random();
  }

  /**
   * Initializes an array of random weights.
   * @param {number} size - The number of weights to initialize.
   * @returns {number[]} An array of random weight values.
   */
  initializeWeights(size) {
    const weights = [];
    for (let i = 0; i < size; i++) {
      weights.push(this.initializeWeight());
    }
    return weights;
  }
}

module.exports = RandomWeightInitialization;