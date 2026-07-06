const ActivationFunction = require('./ActivationFunction');

/**
 * Modified sigmoid function from the original NEAT paper with a 
 * steeper slope. Uses a coefficient of 4.9 to create a sharper 
 * transition.
 * 
 * Formula: `σ(x) = 1 / (1 + e^(-4.9·x))`
 * 
 * @extends ActivationFunction
 */
class NEATSigmoid extends ActivationFunction {
  /**
   * Creates a new NEATSigmoid activation function.
   * @param {number} steepness - The steepness parameter that controls the slope of the sigmoid curve.
   */
  constructor(steepness = 4.9) {
    super();
    this.steepness = steepness;
  }
  
  /**
   * Applies the NEAT sigmoid function to the input value.
   * @param {number} value - The input value to transform.
   * @returns {number} The transformed value in the range (0, 1).
   */
  apply(value) {
    return 1 / (1 + Math.exp(-this.steepness * value));
  }
}

module.exports = NEATSigmoid;