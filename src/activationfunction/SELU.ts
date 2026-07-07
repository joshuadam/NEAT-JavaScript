import { ActivationFunction } from './ActivationFunction';

/**
 * Scaled Exponential Linear Unit combines scaling factors with exponential
 * behavior for negative inputs. Designed to maintain activation
 * distributions through network layers.
 *
 * Formula: `SELU(x) = λ * (x if x > 0 else α * (e^x - 1))`
 *
 * where `λ ≈ 1.0507` and `α ≈ 1.6733`
 */
export class SELU extends ActivationFunction {
  readonly alpha: number = 1.6732632423543772848170429916717;
  readonly scale: number = 1.0507009873554804934193349852946;

  /**
   * Applies the SELU activation function to the input value.
   * @param value - The input value to transform.
   * @returns The SELU-transformed value in range `(λ * α - λ, ∞)`
   */
  apply(value: number): number {
    return this.scale * (value > 0 ? value : this.alpha * (Math.exp(value) - 1));
  }
}
