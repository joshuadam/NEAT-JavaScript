const ActivationFunction = require('./ActivationFunction');

/**
 * Hyperbolic tangent function that outputs values between -1 and 1. 
 * Zero-centered, making it useful for problems requiring negative values.
 * 
 * Formula: `tanh(x) = (e^x - e^-x) / (e^x + e^-x)`
 * 
 * @extends ActivationFunction
 */
class Tanh extends ActivationFunction {
  /**
   * Applies the hyperbolic tangent function to the input value.
   * @param {number} value - The input value to transform.
   * @returns {number} The transformed value in the range (-1, 1).
   */
  apply(value) {
    return Math.tanh(value);
  }
}

module.exports = Tanh;
