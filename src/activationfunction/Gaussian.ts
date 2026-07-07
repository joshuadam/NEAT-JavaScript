import { ActivationFunction } from './ActivationFunction';

/**
 * Bell-shaped function that outputs its maximum value at zero and
 * decreases as input moves away from zero in either direction.
 * Useful for radial basis function networks.
 *
 * Formula: `G(x) = e^(-x²)`
 */
export class Gaussian extends ActivationFunction {
  /**
   * Creates a new Gaussian activation function.
   * @param center - The center point of the Gaussian curve.
   * @param width - The width (standard deviation) of the Gaussian curve.
   */
  constructor(public center: number = 0, public width: number = 1) {
    super();
  }

  /**
   * Applies the Gaussian activation function to a value.
   * @param value - The input value.
   * @returns The Gaussian activation output in range (0, 1].
   */
  apply(value: number): number {
    return Math.exp(-Math.pow((value - this.center) / this.width, 2));
  }
}
