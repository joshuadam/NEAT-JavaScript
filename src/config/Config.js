const Sigmoid = require('../activationfunction/Sigmoid');
const NEATSigmoid = require('../activationfunction/NEATSigmoid');
const Tanh = require('../activationfunction/Tanh');
const ReLU = require('../activationfunction/ReLU');
const LeakyReLU = require('../activationfunction/LeakyReLU');
const Gaussian = require('../activationfunction/Gaussian');
const RandomWeightInitialization = require('../weightinitialization/RandomWeightInitialization');
const XOR = require('../fitnessfunction/XOR');

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

class Config {
  constructor(configObj = {}) {
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
    };

    const mergedConfig = { ...defaults, ...configObj };
    
    Object.keys(mergedConfig).forEach(key => {
      this[key] = mergedConfig[key];
    });

    this.initActivationFunction();
    this.initWeightInitialization();
    this.initFitnessFunction();
  }

  initActivationFunction() {
    if (typeof this.activationFunction === 'string') {
      if (ActivationFunctions[this.activationFunction]) {
        this.activationFunction = new ActivationFunctions[this.activationFunction]();
      } else {
        throw new Error(`Unknown activation function: ${this.activationFunction}`);
      }
    }
  }

  initWeightInitialization() {
    if (typeof this.weightInitialization === 'object' && this.weightInitialization.type) {
      const { type, params = [] } = this.weightInitialization;
      
      if (WeightInitializations[type]) {
        this.weightInitialization = new WeightInitializations[type](...params);
      } else {
        throw new Error(`Unknown weight initialization: ${type}`);
      }
    }
  }

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