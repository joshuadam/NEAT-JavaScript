import { ActivationFunction } from './ActivationFunction';

/**
 * Hyperbolic tangent function that outputs values between -1 and 1.
 * Zero-centered, making it useful for problems requiring negative values.
 *
 * Formula: `tanh(x) = (e^x - e^-x) / (e^x + e^-x)`
 */
export class Tanh extends ActivationFunction {
  /**
   * Applies the hyperbolic tangent function to the input value.
   * @param value - The input value to transform.
   * @returns The transformed value in the range (-1, 1).
   */
  apply(value: number): number {
    return Math.tanh(value);
  }
}
