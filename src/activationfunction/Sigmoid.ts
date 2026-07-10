import { ActivationFunction } from './ActivationFunction';

/**
 * S-shaped function that maps any input to a value between 0 and 1.
 * Often used for outputs that represent probabilities.
 *
 * Formula: `σ(x) = 1 / (1 + e^(-x))`
 */
export class Sigmoid extends ActivationFunction {
  /**
   * Applies the sigmoid activation function to the input value.
   * @param value - The input value to transform.
   * @returns The transformed value in the range (0, 1).
   */
  apply(value: number): number {
    return 1 / (1 + Math.exp(-value));
  }
}
