const ActivationFunction = require('./ActivationFunction');
/**
 * Variant of ReLU that allows small negative values (multiplied by 0.01) 
 * when the input is negative, preventing neurons from becoming inactive.
 * 
 * Formula: `LeakyReLU(x) = max(0.01x, x)`
 * 
 * @extends ActivationFunction
 */
class LeakyReLU extends ActivationFunction {
  /**
   * Creates a new Leaky ReLU activation function.
   * @param {number} alpha - The slope for negative values.
   */
  constructor(alpha = 0.01) {
    super();
    this.alpha = alpha;
  }
  
  /**
   * Applies the Leaky ReLU activation function to the input value.
   * Returns the input if positive, otherwise returns alpha * input.
   * @param {number} value - The input value to transform.
   * @returns {number} The activated value in range (-∞, ∞).
   */
  apply(value) {
    return value > 0 ? value : this.alpha * value;
  }
}
module.exports = LeakyReLU;