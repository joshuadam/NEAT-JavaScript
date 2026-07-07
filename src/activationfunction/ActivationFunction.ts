/**
 * Abstract base class for activation functions used in neural network nodes.
 * Subclasses must implement the {@link ActivationFunction#apply} method.
 * Activation functions define how the output of a neural network node is calculated based on its inputs.
 *
 * The class is intentionally free of private members so any object with a
 * structurally compatible `apply` method is accepted wherever an
 * `ActivationFunction` is expected.
 */
export abstract class ActivationFunction {
  /**
   * Applies the activation function to the given input value.
   * @param value - The input value to transform.
   * @returns The transformed output value.
   */
  abstract apply(value: number): number;
}
