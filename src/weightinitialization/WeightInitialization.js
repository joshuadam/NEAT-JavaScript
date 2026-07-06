/**
 * Abstract base class for weight initialization strategies.
 * Subclasses must implement methods to initialize connection weights in the neural network.
 * @abstract
 */
class WeightInitialization {
  /**
   * Initializes a single weight value.
   * @returns {number} The initialized weight value.
   * @throws {Error} If not implemented by a subclass.
   * @abstract
   */
  initializeWeight() {
    throw new Error("initializeWeight() must be implemented by subclass");
  }

  /**
   * Initializes an array of weight values.
   * @param {number} size - The number of weights to initialize.
   * @returns {number[]} An array of initialized weight values.
   * @throws {Error} If not implemented by a subclass.
   * @abstract
   */
  initializeWeights(size) {
    throw new Error("initializeWeights() must be implemented by subclass");
  }
}

module.exports = WeightInitialization;