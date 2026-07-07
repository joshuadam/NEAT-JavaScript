import { ActivationFunction } from '../activationfunction/ActivationFunction';
import { Sigmoid } from '../activationfunction/Sigmoid';
import { NEATSigmoid } from '../activationfunction/NEATSigmoid';
import { Tanh } from '../activationfunction/Tanh';
import { ReLU } from '../activationfunction/ReLU';
import { LeakyReLU } from '../activationfunction/LeakyReLU';
import { Gaussian } from '../activationfunction/Gaussian';
import { WeightInitialization } from '../weightinitialization/WeightInitialization';
import { RandomWeightInitialization } from '../weightinitialization/RandomWeightInitialization';
import { FitnessFunction } from '../fitnessfunction/FitnessFunction';
import { XOR } from '../fitnessfunction/XOR';

const ActivationFunctions = {
  Sigmoid,
  Tanh,
  ReLU,
  LeakyReLU,
  Gaussian,
  NEATSigmoid
} as const satisfies Record<string, new () => ActivationFunction>;

const WeightInitializations = {
  Random: RandomWeightInitialization
} as const satisfies Record<string, new (...args: never[]) => WeightInitialization>;

const FitnessFunctions = {
  XOR
} as const satisfies Record<string, new () => FitnessFunction>;

/** Names of the built-in activation functions. */
export type ActivationFunctionName = keyof typeof ActivationFunctions;

/** Names of the built-in weight initialization strategies. */
export type WeightInitializationName = keyof typeof WeightInitializations;

/** Names of the built-in fitness functions. */
export type FitnessFunctionName = keyof typeof FitnessFunctions;

/** Determines how bias is applied in the network. */
export type BiasMode = 'WEIGHTED_NODE' | 'DIRECT_NODE' | 'CONSTANT' | 'DISABLED';

/**
 * Declarative weight initialization: a built-in strategy name plus the
 * constructor parameters of that exact strategy. Mapped over the registry so
 * `params` is correlated with `type`.
 */
export type WeightInitializationConfig = {
  [K in WeightInitializationName]: {
    /** The type of weight initialization (e.g., 'Random') */
    type: K;
    /** Parameters for the weight initialization */
    params?: ConstructorParameters<(typeof WeightInitializations)[K]>;
  };
}[WeightInitializationName];

/**
 * User-facing configuration options. Every field is optional; defaults are
 * documented per field. Function-valued fields accept either a built-in name
 * or a custom (structurally compatible) instance.
 */
export interface ConfigOptions {
  /** Number of input nodes in the network. Default 2. */
  inputSize?: number;
  /** Number of output nodes in the network. Default 1. */
  outputSize?: number;
  /** Activation function for the nodes, as a built-in name or a custom instance. Default 'Sigmoid'. */
  activationFunction?: ActivationFunctionName | ActivationFunction;
  /** The value for bias inputs (typically 1.0). Default 1.0. */
  bias?: number;
  /** When true, automatically connects the bias node to all output nodes during network construction. Default true. */
  connectBias?: boolean;
  /** Determines how bias is applied in the network. Default 'WEIGHTED_NODE'. */
  biasMode?: BiasMode;
  /** Whether recurrent connections are allowed in the network. Default true. */
  allowRecurrentConnections?: boolean;
  /** Rate for forming recurrent connections when they are allowed. Default 1.0. */
  recurrentConnectionRate?: number;
  /** Minimum allowed weight value for connections. Default -4.0. */
  minWeight?: number;
  /** Maximum allowed weight value for connections. Default 4.0. */
  maxWeight?: number;
  /** Strategy for initializing connection weights, declaratively or as a custom instance. Default `{ type: 'Random', params: [-1, 1] }`. */
  weightInitialization?: WeightInitializationConfig | WeightInitialization;
  /** Size of the population. Default 150. */
  populationSize?: number;
  /** Maximum number of generations for evolution. Default 100. */
  generations?: number;
  /** Function to evaluate genome fitness, as a built-in name or a custom instance. Default 'XOR'. */
  fitnessFunction?: FitnessFunctionName | FitnessFunction;
  /** Target fitness value to stop evolution. Default 0.95. */
  targetFitness?: number;
  /** Proportion of genomes in species that survives each generation. Default 0.2. */
  survivalRate?: number;
  /** Number of elite individuals to preserve unchanged in each generation. Default 10. */
  numOfElite?: number;
  /** Maximum number of generations without fitness improvement before the population is considered stagnant. Default 20. */
  populationStagnationLimit?: number;
  /** Rate of mating between individuals from different species. Default 0.001. */
  interspeciesMatingRate?: number;
  /** Probability of producing offspring through mutation only (without crossover). Default 0.25. */
  mutateOnlyProb?: number;
  /** Coefficient for excess genes in compatibility distance calculation. Default 1.0. */
  c1?: number;
  /** Coefficient for disjoint genes in compatibility distance calculation. Default 1.0. */
  c2?: number;
  /** Coefficient for weight differences in compatibility distance calculation. Default 0.4. */
  c3?: number;
  /** Maximum compatibility distance for genomes to be considered part of the same species. Default 3.0. */
  compatibilityThreshold?: number;
  /** Maximum age for a species before it is removed if no fitness improvement is observed. Default 15. */
  dropOffAge?: number;
  /** Overall probability of applying mutation to offspring. Default 1.0. */
  mutationRate?: number;
  /** Probability of mutating connection weights. Default 0.8. */
  weightMutationRate?: number;
  /** Probability of adding a new connection. Default 0.05. */
  addConnectionMutationRate?: number;
  /** Probability of adding a new node. Default 0.03. */
  addNodeMutationRate?: number;
  /** Chance of reinitializing a weight when weight mutation is selected (each weight is evaluated individually). Default 0.1. */
  reinitializeWeightRate?: number;
  /** Minimum perturbation value when mutating weights. Default -0.5. */
  minPerturb?: number;
  /** Maximum perturbation value when mutating weights. Default 0.5. */
  maxPerturb?: number;
  /** Probability of keeping connections disabled during crossover if they are disabled in either parent. Default 0.75. */
  keepDisabledOnCrossOverRate?: number;
}

/**
 * The Config class provides a centralized way to configure all aspects
 * of the NEAT algorithm. It manages parameters for network structure,
 * evolution, speciation, and mutation with sensible defaults that can
 * be overridden as needed.
 *
 * After construction, the name/declarative forms of `activationFunction`,
 * `weightInitialization` and `fitnessFunction` are resolved to instances.
 */
export class Config {
  inputSize!: number;
  outputSize!: number;
  activationFunction!: ActivationFunction;
  bias!: number;
  connectBias!: boolean;
  biasMode!: BiasMode;
  allowRecurrentConnections!: boolean;
  recurrentConnectionRate!: number;
  minWeight!: number;
  maxWeight!: number;
  weightInitialization!: WeightInitialization;
  populationSize!: number;
  generations!: number;
  fitnessFunction!: FitnessFunction;
  targetFitness!: number;
  survivalRate!: number;
  numOfElite!: number;
  populationStagnationLimit!: number;
  interspeciesMatingRate!: number;
  mutateOnlyProb!: number;
  c1!: number;
  c2!: number;
  c3!: number;
  compatibilityThreshold!: number;
  dropOffAge!: number;
  mutationRate!: number;
  weightMutationRate!: number;
  addConnectionMutationRate!: number;
  addNodeMutationRate!: number;
  reinitializeWeightRate!: number;
  minPerturb!: number;
  maxPerturb!: number;
  keepDisabledOnCrossOverRate!: number;

  /**
   * Creates a new configuration object with default values that can be
   * overridden by the provided configuration object.
   * @param configObj - Optional object containing configuration parameters to override defaults
   */
  constructor(configObj: ConfigOptions = {}) {
    const defaults = {
      inputSize: 2,
      outputSize: 1,
      activationFunction: 'Sigmoid',
      bias: 1.0,
      connectBias: true,
      biasMode: 'WEIGHTED_NODE',
      allowRecurrentConnections: true,
      recurrentConnectionRate: 1.0,
      minWeight: -4.0,
      maxWeight: 4.0,
      weightInitialization: {
        type: 'Random',
        params: [-1, 1]
      },
      populationSize: 150,
      generations: 100,
      fitnessFunction: 'XOR',
      targetFitness: 0.95,
      survivalRate: 0.2,
      numOfElite: 10,
      populationStagnationLimit: 20,
      interspeciesMatingRate: 0.001,
      mutateOnlyProb: 0.25,
      c1: 1.0,
      c2: 1.0,
      c3: 0.4,
      compatibilityThreshold: 3.0,
      dropOffAge: 15,
      mutationRate: 1.0,
      weightMutationRate: 0.8,
      addConnectionMutationRate: 0.05,
      addNodeMutationRate: 0.03,
      reinitializeWeightRate: 0.1,
      minPerturb: -0.5,
      maxPerturb: 0.5,
      keepDisabledOnCrossOverRate: 0.75
    } satisfies Required<ConfigOptions>;

    const mergedConfig = { ...defaults, ...configObj };

    Object.assign(this, mergedConfig);

    this.initActivationFunction();
    this.initWeightInitialization();
    this.initFitnessFunction();
  }

  /**
   * Initializes the activation function from a string name to an instance.
   * @throws {Error} If the activation function name is unknown.
   */
  initActivationFunction(): void {
    const activation = this.activationFunction as ActivationFunction | ActivationFunctionName;
    if (typeof activation === 'string') {
      const ActivationCtor = ActivationFunctions[activation];
      if (ActivationCtor) {
        this.activationFunction = new ActivationCtor();
      } else {
        throw new Error(`Unknown activation function: ${activation}`);
      }
    }
  }

  /**
   * Initializes the weight initialization strategy from a configuration object to an instance.
   * @throws {Error} If the weight initialization type is unknown.
   */
  initWeightInitialization(): void {
    const weightInit = this.weightInitialization as WeightInitialization | WeightInitializationConfig;
    if (typeof weightInit === 'object' && 'type' in weightInit && weightInit.type) {
      const { type, params } = weightInit;

      const WeightInitCtor = WeightInitializations[type];
      if (WeightInitCtor) {
        this.weightInitialization = new WeightInitCtor(
          ...((params ?? []) as ConstructorParameters<typeof WeightInitCtor>)
        );
      } else {
        throw new Error(`Unknown weight initialization: ${type}`);
      }
    }
  }

  /**
   * Initializes the fitness function from a string name to an instance.
   * @throws {Error} If the fitness function name is unknown.
   */
  initFitnessFunction(): void {
    const fitness = this.fitnessFunction as FitnessFunction | FitnessFunctionName;
    if (typeof fitness === 'string') {
      const FitnessCtor = FitnessFunctions[fitness];
      if (FitnessCtor) {
        this.fitnessFunction = new FitnessCtor();
      } else {
        throw new Error(`Unknown fitness function: ${fitness}`);
      }
    }
  }
}
