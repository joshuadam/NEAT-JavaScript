const ActivationFunction = require('./ActivationFunction');

/**
 * Bell-shaped function that outputs its maximum value at zero and
 * decreases as input moves away from zero in either direction.
 * Useful for radial basis function networks.
 * 
 * Formula: `G(x) = e^(-x²)`
 * 
 * @extends ActivationFunction
 */
class Gaussian extends ActivationFunction {
  /**
   * Creates a new Gaussian activation function.
   * @param {number} center - The center point of the Gaussian curve.
   * @param {number} width - The width (standard deviation) of the Gaussian curve.
   */
  constructor(center = 0, width = 1) {
    super();
    this.center = center;
    this.width = width;
  }
  
  /**
   * Applies the Gaussian activation function to a value.
   * @param {number} value - The input value.
   * @returns {number} The Gaussian activation output in range (0, 1].
   */
  apply(value) {
    return Math.exp(-Math.pow((value - this.center) / this.width, 2));
  }
}

module.exports = Gaussian;