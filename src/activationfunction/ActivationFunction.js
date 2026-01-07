/**
 * Abstract base class for activation functions used in neural network nodes.
 * Subclasses must implement the {@link ActivationFunction#apply} method.
 * Activation functions define how the output of a neural network node is calculated based on its inputs.
 * @abstract
 */
class ActivationFunction {
  /**
   * Applies the activation function to the given input value.
   * @param {number} value - The input value to transform.
   * @returns {number} The transformed output value.
   * @throws {Error} If not implemented by a subclass.
   * @abstract
   */
  apply(value) {
    throw new Error('Apply has to be implemented by a subclass');
  }
}

module.exports = ActivationFunction;
