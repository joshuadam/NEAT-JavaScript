import { ActivationFunction } from './ActivationFunction';

/**
 * Rectified Linear Unit passes positive inputs unchanged
 * and turns negative inputs to zero. Computationally
 * efficient with no upper bound.
 *
 * Formula: `ReLU(x) = max(0, x)`
 */
export class ReLU extends ActivationFunction {
  /**
   * Applies the ReLU activation function to the input value.
   * @param value - The input value to transform.
   * @returns The maximum of 0 and the input value (in range [0, ∞)).
   */
  apply(value: number): number {
    return Math.max(0, value);
  }
}
