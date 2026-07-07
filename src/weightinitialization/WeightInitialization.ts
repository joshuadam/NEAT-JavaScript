/**
 * Abstract base class for weight initialization strategies.
 * Subclasses must implement methods to initialize connection weights in the neural network.
 *
 * The class is intentionally free of private members so any object with
 * structurally compatible methods is accepted wherever a
 * `WeightInitialization` is expected.
 */
export abstract class WeightInitialization {
  /**
   * Initializes a single weight value.
   * @returns The initialized weight value.
   */
  abstract initializeWeight(): number;

  /**
   * Initializes an array of weight values.
   * @param size - The number of weights to initialize.
   * @returns An array of initialized weight values.
   */
  abstract initializeWeights(size: number): number[];
}
