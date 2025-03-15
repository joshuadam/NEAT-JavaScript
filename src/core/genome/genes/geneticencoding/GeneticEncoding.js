const ConnectionGeneData = require("./ConnectionGeneData");
const NodeGeneData = require("./NodeGeneData");
const InputNode = require('../nodegene/InputNode');
const HiddenNode = require('../nodegene/HiddenNode');
const OutputNode = require('../nodegene/OutputNode');
const BiasNode = require("../nodegene/BiasNode");
const ConnectionGene = require('../connectiongene/ConnectionGene')
const NodeType = require('../nodegene/NodeType');

class GeneticEncoding {
  constructor(config, populationId) {
    this.config = config;
    this.nodeGenesMap = new Map();
    this.connectionGenesMap = new Map();
    this.inputNodes = [];
    this.outputNodes = [];
    this.biasNode = null;
    this.fitness = 0;
    this.populationId = populationId;
  }

  loadGenome(genome) {
    this.nodeGenesMap.clear();
    this.connectionGenesMap.clear();

    for (const connection of genome.connectionGenes) {
      this.connectionGenesMap.set(connection.innovationNumber, new ConnectionGeneData(connection.inNode.id, connection.outNode.id, connection.weight, connection.enabled, connection.innovationNumber, connection.recurrent));
    }

    for (const node of genome.nodeGenes) {
      this.nodeGenesMap.set(node.id, new NodeGeneData(node.id, node.nodeType));
      if (node instanceof InputNode) {
        this.inputNodes.push(new NodeGeneData(node.id, node.nodeType));
      } else if (node instanceof OutputNode) {
        this.outputNodes.push(new NodeGeneData(node.id, node.nodeType));
      } else if (node instanceof BiasNode) {
        this.biasNode = new NodeGeneData(node.id, node.nodeType);
      }
    }
    this.fitness = genome.fitness;
  }

  crossover(otherParent) {
    let offspring = new GeneticEncoding(this.config, this.populationId);
    let thisFitness = this.fitness;
    let otherFitness = otherParent.fitness;

    let bestParent = null;
    let worstParent = null;
    if (thisFitness > otherFitness) {
      bestParent = this;
      worstParent = otherParent;
    } else if (otherFitness > thisFitness) {
      bestParent = otherParent;
      worstParent = this;
    } else if (thisFitness === otherFitness) {
      bestParent = this.connectionGenesMap.size < otherParent.connectionGenesMap.size ? this : otherParent;
      worstParent = this.connectionGenesMap.size < otherParent.connectionGenesMap.size ? otherParent : this;
    }

    for (const [innovationNumber, currentGene] of bestParent.connectionGenesMap) {
      if (worstParent.hasInnovationNumber(innovationNumber)) {
        let parent2Gene = worstParent.getConnectionByInnovationNumber(innovationNumber);
        let selectedParent = Math.random() < 0.5 ? bestParent : worstParent;
        let selectedGene = selectedParent.getConnectionByInnovationNumber(innovationNumber);
        let isEnabled = !currentGene.enabled || !parent2Gene.enabled ? Math.random() > this.config.keepDisabledOnCrossOverRate : true;

        if (this.config.keepDisabledOnCrossOverRate === -1) {
          isEnabled = selectedGene.enabled;
        }
        offspring.addConnectionAndNodes(selectedGene, isEnabled, selectedParent, bestParent);
      } else {
        let isEnabled = !currentGene.enabled ? Math.random() > this.config.keepDisabledOnCrossOverRate : true;
        if (this.config.keepDisabledOnCrossOverRate === -1) {
          isEnabled = currentGene.enabled;
        }
        offspring.addConnectionAndNodes(currentGene, isEnabled, bestParent, bestParent);
      }
    }

    for (const inputNode of this.inputNodes) {
      offspring.addNode(inputNode);
    }
    for (const outputNode of this.outputNodes) {
      offspring.addNode(outputNode);
    }
    if (this.biasNode !== null) {
      offspring.addNode(this.biasNode);
    }

    return offspring;
  }

  calculateCompatibilityDistance(otherParent) {
    const disjointGenes = this.getNumberOfDisjointGenes(otherParent);
    const excessGenes = this.getNumberOfExcessGenes(otherParent);
    let maxGenes = Math.max(this.connectionGenesMap.size, otherParent.connectionGenesMap.size);
    maxGenes = maxGenes < 20 ? 1 : maxGenes;
    return ((this.config.c1 * excessGenes) / maxGenes) + ((this.config.c2 * disjointGenes) / maxGenes) + ((this.config.c3 * this.calculateAverageWeightDifference(otherParent)));
  }

  getNumberOfMatchingGenes(otherParent) {
    let matchingGenes = 0;
    for (const innovationNumber of this.connectionGenesMap.keys()) {
      if (otherParent.hasInnovationNumber(innovationNumber)) {
        matchingGenes++;
      }
    }
    return matchingGenes;
  }

  getNumberOfDisjointGenes(otherParent) {
    let disjointGenes = 0;
    const maxInnovationSelf = this.getHighestInnovationNumber();
    const maxInnovationOther = otherParent.getHighestInnovationNumber();
    const comparisonLimit = Math.min(maxInnovationSelf, maxInnovationOther);

    for (const innovationNumber of this.connectionGenesMap.keys()) {
      if (innovationNumber <= comparisonLimit && !otherParent.hasInnovationNumber(innovationNumber)) {
        disjointGenes++;
      }
    }

    for (const innovationNumber of otherParent.connectionGenesMap.keys()) {
      if (innovationNumber <= comparisonLimit && !this.hasInnovationNumber(innovationNumber)) {
        disjointGenes++;
      }
    }

    return disjointGenes;
  }

  getNumberOfExcessGenes(otherParent) {
    let excessGenes = 0;
    const maxInnovationSelf = this.getHighestInnovationNumber();
    const maxInnovationOther = otherParent.getHighestInnovationNumber();
    const largerParent = maxInnovationSelf > maxInnovationOther ? this : otherParent;
    const minInnovation = Math.min(maxInnovationSelf, maxInnovationOther);

    for (const innovationNumber of largerParent.connectionGenesMap.keys()) {
      if (innovationNumber > minInnovation) {
        excessGenes++;
      }
    }
    return excessGenes;
  }

  calculateAverageWeightDifference(otherParent) {
    let totalWeightDifference = 0;
    let matchinigGenesCount = 0;

    for (const [innovationNumber, connection] of this.connectionGenesMap) {
      if (otherParent.hasInnovationNumber(innovationNumber)) {
        let otherGene = otherParent.getConnectionByInnovationNumber(innovationNumber);
        let weightDifference = Math.abs(connection.weight - otherGene.weight);
        totalWeightDifference += weightDifference;
        matchinigGenesCount++;
      }
    }
    if (matchinigGenesCount === 0) {
      return 0;
    }
    return totalWeightDifference / matchinigGenesCount;
  }

  buildGenome() {
    const Genome = require('../../Genome');
    let newNodeGenesMap = new Map();
    let newNodeGenes = [];

    for (const oldNode of this.nodeGenesMap.values()) {
      let newNode = null;
      switch (oldNode.nodeType) {
        case NodeType.INPUT:
          newNode = new InputNode(oldNode.id, this.config);
          break;
        case NodeType.HIDDEN:
          newNode = new HiddenNode(oldNode.id, this.config);
          break;
        case NodeType.OUTPUT:
          newNode = new OutputNode(oldNode.id, this.config);
          break;
        case NodeType.BIAS:
          newNode = new BiasNode(oldNode.id, this.config);
          break;
      }

      if (newNode !== null) {
        newNodeGenesMap.set(newNode.id, newNode);
        newNodeGenes.push(newNode);
      }
    }

    let newConnectionGenes = [];

    for (const oldConnection of this.connectionGenesMap.values()) {
      const newInNode = newNodeGenesMap.get(oldConnection.inNodeId);
      const newOutNode = newNodeGenesMap.get(oldConnection.outNodeId);

      const newConnection = new ConnectionGene(
        newInNode,
        newOutNode,
        oldConnection.weight,
        oldConnection.enabled,
        oldConnection.innovationNumber,
        oldConnection.recurrent,
        this.config
      );
      newConnectionGenes.push(newConnection);
    }

    const genome = new Genome(newNodeGenes, newConnectionGenes, this.config, this.populationId);
    genome.checkForRecurrentConnections();
    return genome;
  }

  addConnectionAndNodes(connection, enabled, parent, bestParent) {
    let outNodeType = parent.getNodeById(connection.outNodeId).nodeType;
    if (outNodeType === NodeType.INPUT) {
      throw new Error(`Invalid connection: Input node ${connection.outNodeId} cannot be used as out node.`);
    }
    let bestParentConnection = bestParent.getConnectionByInnovationNumber(connection.innovationNumber);
    let newConnection = new ConnectionGeneData(
      connection.inNodeId,
      connection.outNodeId,
      connection.weight,
      enabled,
      connection.innovationNumber,
      bestParentConnection.recurrent
    );

    this.addConnection(newConnection);

    let inNode = new NodeGeneData(connection.inNodeId, parent.getNodeById(connection.inNodeId).nodeType);
    let outNode = new NodeGeneData(connection.outNodeId, parent.getNodeById(connection.outNodeId).nodeType);

    this.addNode(inNode);
    this.addNode(outNode);
  }

  getHighestInnovationNumber() {
    const highestInnovationNumber = Math.max(...Array.from(this.connectionGenesMap.keys()), 0);
    return highestInnovationNumber;
  }

  hasInnovationNumber(innovationNumber) {
    return this.connectionGenesMap.has(innovationNumber);
  }

  getNodeById(id) {
    if (!this.nodeGenesMap.has(id)) {
      throw new Error(`Error: Node with ID ${id} does not exist.`);
    }
    return this.nodeGenesMap.get(id);
  }

  getConnectionByInnovationNumber(innovationNumber) {
    return this.connectionGenesMap.get(innovationNumber);
  }

  addConnection(connection) {
    for (let existingConnection of this.connectionGenesMap.values()) {
      if (existingConnection.inNodeId === connection.inNodeId &&
        existingConnection.outNodeId === connection.outNodeId) {
        return;
      }
    }
    this.connectionGenesMap.set(connection.innovationNumber, connection);
  }

  hasNodeId(nodeId) {
    return this.nodeGenesMap.has(nodeId);
  }

  addNode(node) {
    if (this.nodeGenesMap.has(node.id)) {
      return;
    }
    this.nodeGenesMap.set(node.id, node);

    switch (node.nodeType) {
      case 'INPUT':
        this.inputNodes.push(node);
        break;
      case 'OUTPUT':
        this.outputNodes.push(node);
        break;
      case 'BIAS':
        this.biasNode = node;
        break;
    }
  }

}

module.exports = GeneticEncoding;