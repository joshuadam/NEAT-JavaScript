const ActivationFunction = require('./ActivationFunction');

/**
 * Rectified Linear Unit passes positive inputs unchanged 
 * and turns negative inputs to zero. Computationally 
 * efficient with no upper bound.
 * 
 * Formula: `ReLU(x) = max(0, x)`
 * 
 * @extends ActivationFunction
 */
class ReLU extends ActivationFunction {
  /**
   * Applies the ReLU activation function to the input value.
   * @param {number} value - The input value to transform.
   * @returns {number} The maximum of 0 and the input value (in range [0, ∞)).
   */
  apply(value) {
    return Math.max(0, value);
  }
}

module.exports = ReLU;
