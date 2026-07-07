import { ActivationFunction } from './ActivationFunction';

/**
 * Variant of ReLU that allows small negative values (multiplied by 0.01)
 * when the input is negative, preventing neurons from becoming inactive.
 *
 * Formula: `LeakyReLU(x) = max(0.01x, x)`
 */
export class LeakyReLU extends ActivationFunction {
  /**
   * Creates a new Leaky ReLU activation function.
   * @param alpha - The slope for negative values.
   */
  constructor(public alpha: number = 0.01) {
    super();
  }

  /**
   * Applies the Leaky ReLU activation function to the input value.
   * Returns the input if positive, otherwise returns alpha * input.
   * @param value - The input value to transform.
   * @returns The activated value in range (-∞, ∞).
   */
  apply(value: number): number {
    return value > 0 ? value : this.alpha * value;
  }
}
