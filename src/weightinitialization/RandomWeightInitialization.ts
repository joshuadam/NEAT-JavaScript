import { WeightInitialization } from './WeightInitialization';

/**
 * Random weight initialization strategy.
 * Initializes weights with random values uniformly distributed within a specified range.
 */
export class RandomWeightInitialization extends WeightInitialization {
  /**
   * Creates a new RandomWeightInitialization instance.
   * @param min - The minimum value for random weights (inclusive).
   * @param max - The maximum value for random weights (exclusive).
   */
  constructor(public min: number, public max: number) {
    super();
  }

  /**
   * Initializes a single weight with a random value within the configured range.
   * @returns A random weight value between min and max.
   */
  initializeWeight(): number {
    return this.min + (this.max - this.min) * Math.random();
  }

  /**
   * Initializes an array of random weights.
   * @param size - The number of weights to initialize.
   * @returns An array of random weight values.
   */
  initializeWeights(size: number): number[] {
    const weights: number[] = [];
    for (let i = 0; i < size; i++) {
      weights.push(this.initializeWeight());
    }
    return weights;
  }
}
