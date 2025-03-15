const StaticManager = require('./StaticManager');
const PopulationTracker = require('./trackers/PopulationTracker');
const Genome = require('../core/genome/Genome');
const InputNode = require('../core/genome/genes/nodegene/InputNode');
const OutputNode = require('../core/genome/genes/nodegene/OutputNode');
const BiasNode = require('../core/genome/genes/nodegene/BiasNode');
const ConnectionGene = require('../core/genome/genes/connectiongene/ConnectionGene');

class GenomeBuilder {
  static buildGenome(config, populationId = PopulationTracker.getNextPopulationId()) {
    let numInputs = config.inputSize;
    let numOutputs = config.outputSize;

    let nodeGenes = [];
    let connectionGenes = [];

    for (let i = 0; i < numInputs; i++) {
      nodeGenes.push(new InputNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config));
    }

    for (let i = 0; i < numOutputs; i++) {
      nodeGenes.push(new OutputNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config));
    }

    let biasNode = null;
    if (config.biasMode !== 'DISABLED' && config.biasMode !== 'CONSTANT') {
    biasNode = new BiasNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config);
    nodeGenes.push(biasNode);
    }

    let connectionIndex = 0;

    for (let inputIdx = 0; inputIdx < numInputs; inputIdx++) {
      let inputNode = nodeGenes[inputIdx];

      for (let outputIdx = numInputs; outputIdx < numInputs + numOutputs; outputIdx++) {
        let outputNode = nodeGenes[outputIdx];
        let innovationData = StaticManager.getInnovationTracker(populationId)
          .trackInnovation(inputNode.id, outputNode.id);

        connectionGenes.push(new ConnectionGene(
          inputNode,
          outputNode,
          config.weightInitialization.initializeWeight(),
          true,
          innovationData.innovationNumber,
          false,
          config
        ));
        connectionIndex++;
      }
    }

    if (config.connectBias && config.biasMode !== 'DISABLED' && config.biasMode !== 'CONSTANT') {
      for (let outputIdx = numInputs; outputIdx < numInputs + numOutputs; outputIdx++) {
        let outputNode = nodeGenes[outputIdx];
        let innovationData = StaticManager.getInnovationTracker(populationId)
          .trackInnovation(biasNode.id, outputNode.id);

        connectionGenes.push(new ConnectionGene(
          biasNode,
          outputNode,
          config.weightInitialization.initializeWeight(),
          true,
          innovationData.innovationNumber,
          false,
          config
        ));
        connectionIndex++;
      }
    }
    return new Genome(nodeGenes, connectionGenes, config, populationId);
  }

  static loadGenome(jsonData, config) {
    const parsedData = JSON.parse(jsonData);

    const nodeGenes = [];

    parsedData.nodeGenes.forEach(nodeData => {
      let node;
      switch (nodeData.type) {
        case 'INPUT':
          node = new InputNode(nodeData.id, config);
          break;
        case 'HIDDEN':
          node = new HiddenNode(nodeData.id, config);
          break;
        case 'OUTPUT':
          node = new OutputNode(nodeData.id, config);
          break;
        case 'BIAS':
          node = new BiasNode(nodeData.id, config);
          break;
        default:
          throw new Error(`Unknown node type: ${nodeData.type}`);
      }
      nodeGenes.push(node);
    });

    const connectionGenes = [];

    parsedData.connectionGenes.forEach(connData => {
      const inNode = nodeGenes.find(node => node.id === connData.inNodeId);
      const outNode = nodeGenes.find(node => node.id === connData.outNodeId);

      if (!inNode || !outNode) {
        throw new Error('Connection refers to a non-existing node');
      }

      const connection = new ConnectionGene(
        inNode, outNode, connData.weight, connData.enabled,
        connData.innovationNumber, connData.recurrent, config
      );
      connectionGenes.push(connection);
    });

    const genome = new Genome(nodeGenes, connectionGenes, config, parsedData.populationId);
    genome.fitness = parsedData.fitness;

    return genome;
  }
}

module.exports = GenomeBuilder;