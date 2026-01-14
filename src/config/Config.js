const Sigmoid = require('../activationfunction/Sigmoid');
const NEATSigmoid = require('../activationfunction/NEATSigmoid');
const Tanh = require('../activationfunction/Tanh');
const ReLU = require('../activationfunction/ReLU');
const LeakyReLU = require('../activationfunction/LeakyReLU');
const Gaussian = require('../activationfunction/Gaussian');
const RandomWeightInitialization = require('../weightinitialization/RandomWeightInitialization');
const XOR = require('../fitnessfunction/XOR');

/** @typedef {import('../activationfunction/ActivationFunction')} ActivationFunction */
/** @typedef {import('../weightinitialization/WeightInitialization')} WeightInitialization */
/** @typedef {import('../fitnessfunction/FitnessFunction')} FitnessFunction */

/**
 * @typedef {Object} WeightInitializationConfig
 * @property {keyof typeof WeightInitializations} type - The type of weight initialization (e.g., 'Random')
 * @property {ConstructorParameters<typeof WeightInitializations[keyof typeof WeightInitializations]>} [params] - Parameters for the weight initialization
 */

/**
 * @typedef {Object} ConfigOptions
 * @property {number} [inputSize=2] - Number of input nodes in the network
 * @property {number} [outputSize=1] - Number of output nodes in the network
 * @property {keyof typeof ActivationFunctions | ActivationFunction} [activationFunction='Sigmoid'] - Activation function for the nodes. Can be specified as a string name from available functions or as a custom function object
 * @property {number} [bias=1.0] - The value for bias inputs (typically 1.0)
 * @property {boolean} [connectBias=true] - When true, automatically connects the bias node to all output nodes during network construction
 * @property {'WEIGHTED_NODE' | 'DIRECT_NODE' | 'CONSTANT' | 'DISABLED'} [biasMode='WEIGHTED_NODE'] - Determines how bias is applied in the network
 * @property {boolean} [allowRecurrentConnections=true] - Whether recurrent connections are allowed in the network
 * @property {number} [recurrentConnectionRate=1.0] - Rate for forming recurrent connections when they are allowed
 * @property {number} [minWeight=-4.0] - Minimum allowed weight value for connections
 * @property {number} [maxWeight=4.0] - Maximum allowed weight value for connections
 * @property {WeightInitializationConfig | WeightInitialization} [weightInitialization] - Strategy for initializing connection weights. Can be specified as an object with type and parameters or as a custom weight initialization object
 * @property {number} [populationSize=150] - Size of the population
 * @property {number} [generations=100] - Maximum number of generations for evolution
 * @property {keyof typeof FitnessFunctions | FitnessFunction} [fitnessFunction='XOR'] - Function to evaluate genome fitness. Can be specified as a string name from available functions or as a custom function object
 * @property {number} [targetFitness=0.95] - Target fitness value to stop evolution.
 * @property {number} [survivalRate=0.2] - Proportion of genomes in species that survives each generation
 * @property {number} [numOfElite=10] - Number of elite individuals to preserve unchanged in each generation
 * @property {number} [populationStagnationLimit=20] - Maximum number of generations without fitness improvement before population is considered stagnant
 * @property {number} [interspeciesMatingRate=0.001] - Rate of mating between individuals from different species
 * @property {number} [mutateOnlyProb=0.25] - Probability of producing offspring through mutation only (without crossover)
 * @property {number} [c1=1.0] - Coefficient for excess genes in compatibility distance calculation
 * @property {number} [c2=1.0] - Coefficient for disjoint genes in compatibility distance calculation
 * @property {number} [c3=0.4] - Coefficient for weight differences in compatibility distance calculation
 * @property {number} [compatibilityThreshold=3.0] - Maximum compatibility distance for genomes to be considered part of the same species
 * @property {number} [dropOffAge=15] - Maximum age for a species before it is removed if no fitness improvement is observed
 * @property {number} [mutationRate=1.0] - Overall probability of applying mutation to offspring
 * @property {number} [weightMutationRate=0.8] - Probability of mutating connection weights
 * @property {number} [addConnectionMutationRate=0.05] - Probability of adding a new connection
 * @property {number} [addNodeMutationRate=0.03] - Probability of adding a new node
 * @property {number} [reinitializeWeightRate=0.1] - Chance of reinitializing a weight when weight mutation is selected (each weight is evaluated individually)
 * @property {number} [minPerturb=-0.5] - Minimum perturbation value when mutating weights
 * @property {number} [maxPerturb=0.5] - Maximum perturbation value when mutating weights
 * @property {number} [keepDisabledOnCrossOverRate=0.75] - Probability of keeping connections disabled during crossover if they are disabled in either parent
 */

const ActivationFunctions = {
  'Sigmoid': Sigmoid,
  'Tanh': Tanh,
  'ReLU': ReLU,
  'LeakyReLU': LeakyReLU,
  'Gaussian': Gaussian,
  'NEATSigmoid' : NEATSigmoid
};

const WeightInitializations = {
  'Random': RandomWeightInitialization
};

const FitnessFunctions = {
  'XOR': XOR
};

/**
 * The Config class provides a centralized way to configure all aspects 
 * of the NEAT algorithm. It manages parameters for network structure, 
 * evolution, speciation, and mutation with sensible defaults that can 
 * be overridden as needed.
 */
class Config {
  inputSize = 2
  outputSize = 1
  activationFunction = 'Sigmoid'
  bias = 1.0
  connectBias = true
  biasMode = 'WEIGHTED_NODE'
  allowRecurrentConnections = true
  recurrentConnectionRate = 1.0
  minWeight = -4.0
  maxWeight = 4.0
  weightInitialization = {
    type: 'Random',
    params: [-1, 1]
  }
  populationSize = 150
  generations = 100
  fitnessFunction = 'XOR'
  targetFitness = 0.95
  survivalRate = 0.2
  numOfElite = 10
  populationStagnationLimit = 20
  interspeciesMatingRate = 0.001
  mutateOnlyProb = 0.25
  c1 = 1.0
  c2 = 1.0
  c3 = 0.4
  compatibilityThreshold = 3.0
  dropOffAge = 15
  mutationRate = 1.0
  weightMutationRate = 0.8
  addConnectionMutationRate = 0.05
  addNodeMutationRate = 0.03
  reinitializeWeightRate = 0.1
  minPerturb = -0.5
  maxPerturb = 0.5
  keepDisabledOnCrossOverRate = 0.75

  /**
   * Creates a new configuration object with default values that can be 
   * overridden by the provided configuration object.
   * @param {ConfigOptions} configObj - Optional object containing configuration parameters to override defaults
   */
  constructor(configObj = {}) {
    Object.assign(this, configObj);

    /** @ts-ignore */
    this.initActivationFunction();
    /** @ts-ignore */
    this.initWeightInitialization();
    /** @ts-ignore */
    this.initFitnessFunction();
  }

  /**
   * Initializes the activation function from a string name to an instance.
   * @throws {Error} If the activation function name is unknown.
   * @this {ConfigOptions}
   */
  initActivationFunction() {
    if (typeof this.activationFunction === 'string') {
      if (ActivationFunctions[this.activationFunction]) {
        this.activationFunction = new ActivationFunctions[this.activationFunction]();
      } else {
        throw new Error(`Unknown activation function: ${this.activationFunction}`);
      }
    }
  }

  /**
   * Initializes the weight initialization strategy from a configuration object to an instance.
   * @throws {Error} If the weight initialization type is unknown.
   * @this {ConfigOptions}
   */
  initWeightInitialization() {
    if (typeof this.weightInitialization === 'object' && 'type' in this.weightInitialization) {
      const { type, params = [] } =  this.weightInitialization;
      
      if (WeightInitializations[type]) {
        // @ts-ignore
        this.weightInitialization = new WeightInitializations[type](...params);
      } else {
        throw new Error(`Unknown weight initialization: ${type}`);
      }
    }
  }

  /**
   * Initializes the fitness function from a string name to an instance.
   * @throws {Error} If the fitness function name is unknown.
   * @this {ConfigOptions}
   */
  initFitnessFunction() {
    if (typeof this.fitnessFunction === 'string') {
      if (FitnessFunctions[this.fitnessFunction]) {
        this.fitnessFunction = new FitnessFunctions[this.fitnessFunction]();
      } else {
        throw new Error(`Unknown fitness function: ${this.fitnessFunction}`);
      }
    }
  }
}

module.exports = Config;
