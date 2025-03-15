const ActivationFunction = require('./activationfunction/ActivationFunction');
const Gaussian = require('./activationfunction/Gaussian');
const LeakyReLU = require('./activationfunction/LeakyReLU');
const NEATSigmoid = require('./activationfunction/NEATSigmoid');
const ReLU = require('./activationfunction/ReLU');
const SELU = require('./activationfunction/SELU');
const Sigmoid = require('./activationfunction/Sigmoid');
const Tanh = require('./activationfunction/Tanh');
const Algorithm = require('./algorithm/Algorithm');
const Config = require('./config/Config');
const ConnectionGene = require('./core/genome/genes/connectiongene/ConnectionGene');
const ConnectionGeneData = require('./core/genome/genes/geneticencoding/ConnectionGeneData');
const GeneticEncoding = require('./core/genome/genes/geneticencoding/GeneticEncoding');
const NodeGeneData = require('./core/genome/genes/geneticencoding/NodeGeneData');
const BiasNode = require('./core/genome/genes/nodegene/BiasNode');
const HiddenNode = require('./core/genome/genes/nodegene/HiddenNode');
const InputNode = require('./core/genome/genes/nodegene/InputNode');
const NodeGene = require('./core/genome/genes/nodegene/NodeGene');
const NodeType = require('./core/genome/genes/nodegene/NodeType');
const OutputNode = require('./core/genome/genes/nodegene/OutputNode');
const Genome = require('./core/genome/Genome');
const Population = require('./core/population/Population');
const Species = require('./core/population/Species');
const FitnessFunction = require('./fitnessfunction/FitnessFunction');
const XOR = require('./fitnessfunction/XOR');
const ConfigTracker = require('./util/trackers/ConfigTracker');
const GenomeTracker = require('./util/trackers/GenomeTracker');
const InnovationTracker = require('./util/trackers/InnovationTracker');
const NodeTracker = require('./util/trackers/NodeTracker');
const PopulationTracker = require('./util/trackers/PopulationTracker');
const GenomeBuilder = require('./util/GenomeBuilder');
const StaticManager = require('./util/StaticManager');
const WeightInitialization = require('./weightinitialization/WeightInitialization');
const RandomWeightInitialization = require('./weightinitialization/RandomWeightInitialization');

module.exports = {
  ActivationFunction,
  Gaussian,
  LeakyReLU,
  NEATSigmoid,
  ReLU,
  SELU,
  Sigmoid,
  Tanh,
  Algorithm,
  Config,
  ConnectionGene,
  ConnectionGeneData,
  GeneticEncoding,
  NodeGeneData,
  BiasNode,
  HiddenNode,
  InputNode,
  NodeGene,
  NodeType,
  OutputNode,
  Genome,
  Population,
  Species,
  FitnessFunction,
  XOR,
  InnovationTracker,
  ConfigTracker,
  GenomeTracker,
  NodeTracker,
  PopulationTracker,
  StaticManager,
  WeightInitialization,
  RandomWeightInitialization,
  GenomeBuilder
};