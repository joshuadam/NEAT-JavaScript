const InputNode = require('./genes/nodegene/InputNode');
const HiddenNode = require('./genes/nodegene/HiddenNode');
const BiasNode = require('./genes/nodegene/BiasNode');
const OutputNode = require('./genes/nodegene/OutputNode');
const ConnectionGene = require('./genes/connectiongene/ConnectionGene');
const StaticManager = require('../../util/StaticManager');
const GeneticEncoding = require('./genes/geneticencoding/GeneticEncoding');

/** @typedef {import('../../config/Config')} Config */
/** @typedef {import('./genes/nodegene/NodeGene')} NodeGene */
/** @typedef {import('../../util/trackers/GenomeTracker')} GenomeTracker */
/** @typedef {import('../../util/trackers/NodeTracker')} NodeTracker */
/** @typedef {import('../../util/trackers/InnovationTracker')} InnovationTracker */

/**
 * The Genome class is the core genetic representation in NEAT. 
 * It encodes the structure and parameters of a neural network, 
 * including nodes (neurons) and connections between them. Each 
 * genome can be expressed as a neural network for evaluation, 
 * and can undergo genetic operations like mutation and crossover.
 */
class Genome {
  /**
   * Creates a new genome with the specified nodes, connections, configuration, and population ID.
   * @param {NodeGene[]} nodeGenes - Array of node genes (InputNode, HiddenNode, OutputNode, BiasNode)
   * @param {ConnectionGene[]} connectionGenes - Array of connection genes
   * @param {Config} config - Configuration parameters for the genome
   * @param {number} populationId - ID of the population this genome belongs to
   */
  constructor(nodeGenes, connectionGenes, config, populationId) {
    /** @type {NodeGene[]} */
    this.nodeGenes = nodeGenes;
    /** @type {ConnectionGene[]} */
    this.connectionGenes = connectionGenes;
    /** @type {InputNode[]} */
    this.inputNodes = nodeGenes.filter(node => node instanceof InputNode);
    /** @type {OutputNode[]} */
    this.outputNodes = nodeGenes.filter(node => node instanceof OutputNode);
    /** @type {BiasNode|null} */
    this.biasNode = nodeGenes.find(node => node instanceof BiasNode) || null;
    /** @type {Config} */
    this.config = config;
    /** @type {GenomeTracker} */
    this.genomeTracker = StaticManager.getGenomeTracker(populationId);
    /** @type {NodeTracker} */
    this.nodeTracker = StaticManager.getNodeTracker(populationId);
    /** @type {InnovationTracker} */
    this.innovationTracker = StaticManager.getInnovationTracker(populationId);
    /** @type {number} */
    this.id = this.genomeTracker.getNextGenomeId();
    /** @type {number} */
    this.fitness = 0;
    /** @type {number} */
    this.adjustedFitness = 0;
    /** @type {number} */
    this.populationId = populationId;
  }

  /**
   * Activates the neural network represented by the genome with 
   * the given inputs and returns the outputs.
   * @param {number[]} inputs - Array of input values for the network
   * @returns {number[]} Array of output values produced by the network
   */
  propagate(inputs) {
    this.calculateExpectedInputs();
    for (let i = 0; i < inputs.length; i++) {
      let inputNode = /** @type {InputNode} */ (this.getNodeById(i));
      inputNode.feedInput(inputs[i]);
    }

    let outputs = new Array(this.outputNodes.length);
    for (let i = 0; i < this.outputNodes.length; i++) {
      let outputNode = this.getNodeById(i + this.inputNodes.length);
      outputs[i] = outputNode.lastOutput;
    }

    return outputs;
  }

  /**
   * Resets the internal state of all nodes in the network. 
   * This is particularly useful when working with recurrent networks.
   */
  resetState() {
    for (const node of this.nodeGenes) {
      node.resetState();
    }
  }

  /**
   * Calculates the expected number of inputs for each node in the network.
   */
  calculateExpectedInputs() {
    for (const node of this.nodeGenes) {
      node.expectedInputs = 0;
      node.receivedInputs = 0;
    }

    for (const connection of this.connectionGenes) {
      connection.forwardedExpectedInput = false;
    }

    for (const node of this.inputNodes) {
      node.calculateExpectedInputs();
    }
  }

  /**
   * Finds a node in the genome by its ID.
   * @param {number} nodeid - The ID of the node to find.
   * @returns {NodeGene} The node with the given ID
   */
  getNodeById(nodeid) {
    return /**@type {NodeGene}*/ (this.nodeGenes.find(node => node.id === nodeid));
  }

  /**
   * Applies random mutations to the genome according to the 
   * rates defined in the configuration. Mutations can include 
   * weight changes, adding connections, or adding nodes.
   */
  mutate() {
    const weightMutationRate = this.config.weightMutationRate;
    const addConnectionMutationRate = this.config.addConnectionMutationRate;
    const addNodeMutationRate = this.config.addNodeMutationRate;

    if (Math.random() < weightMutationRate) {
      this.mutateWeights();
    }
    if (Math.random() < addConnectionMutationRate) {
      this.mutateAddConnection();
    }
    if (Math.random() < addNodeMutationRate) {
      this.mutateAddNode();
    }
  }

  /**
   * Mutates the weights of existing connections. Each connection's 
   * weight may be either perturbed or completely reinitialized 
   * according to the configuration parameters.
   */
  mutateWeights() {
    const minWeight = this.config.minWeight;
    const maxWeight = this.config.maxWeight;

    for (const connection of this.connectionGenes) {
      if (Math.random() < this.config.reinitializeWeightRate) {
        connection.reinitializeWeight();
      } else {
        let weight = connection.weight;
        let perturb = this.config.minPerturb + (this.config.maxPerturb - this.config.minPerturb) * Math.random();
        let newWeight = weight + perturb;
        newWeight = Math.max(minWeight, Math.min(newWeight, maxWeight));
        connection.weight = newWeight;
      }
    }
  }

  /**
   * Attempts to add a new connection between two existing nodes. 
   * Checks for existing connections and potential recursion 
   * before adding.
   */
  mutateAddConnection() {
    let fromNode;
    let toNode;
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      fromNode = this.nodeGenes[Math.floor(Math.random() * this.nodeGenes.length)];
      toNode = this.nodeGenes[Math.floor(Math.random() * this.nodeGenes.length)];

      if (!fromNode.acceptsOutgoingConnections() || !toNode.acceptsIncomingConnections()) {
        attempts++;
        continue;
      }

      let connectionExists = false;
      for (let connection of this.connectionGenes) {
        if (connection.inNode === fromNode && connection.outNode === toNode) {
          connectionExists = true;
          break;
        }
      }

      if (connectionExists) {
        attempts++;
        continue;
      }

      let isRecurrent = this.checkIfRecurrent(fromNode, toNode);
      let recurrentConnectionRate = this.config.recurrentConnectionRate;
      let allowRecurrentConnections = this.config.allowRecurrentConnections;

      if (isRecurrent) {
        if (!allowRecurrentConnections || Math.random() > recurrentConnectionRate) {
          attempts++;
          continue;
        }
      }

      const innovationData = this.innovationTracker.trackInnovation(fromNode.id, toNode.id);

      const newConnection = new ConnectionGene(fromNode, toNode, this.config.weightInitialization.initializeWeight(), true, innovationData.innovationNumber, isRecurrent, this.config);
      this.connectionGenes.push(newConnection);
      if (newConnection.recurrent !== this.checkIfRecurrent(newConnection.inNode, newConnection.outNode)) {
        throw new Error('recurrent is not the same');
      }
      break;
    }
  }

  /**
   * Adds a new hidden node by splitting an existing connection. 
   * The original connection is disabled, and two new 
   * connections are created.
   */
  mutateAddNode() {
    if (this.connectionGenes.length < 1) {
      return;
    }

    let selectedConnection = null;
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      let potentialConnection = this.connectionGenes[Math.floor(Math.random() * this.connectionGenes.length)];
      if (potentialConnection.enabled) {
        selectedConnection = potentialConnection;
        break;
      }
      attempts++;
    }
    if (selectedConnection === null) {
      return;
    }

    selectedConnection.enabled = false;
    
    const innovations = this.innovationTracker.trackAddNodeInnovation(
      selectedConnection, 
      this.populationId
    );
    let newNode = new HiddenNode(innovations.newNodeId, this.config);
    this.nodeGenes.push(newNode);

    let connection1 = new ConnectionGene(selectedConnection.inNode, newNode, 1, true, innovations.inToNew.innovationNumber, false, this.config);
    let connection2 = new ConnectionGene(newNode, selectedConnection.outNode, selectedConnection.weight, true, innovations.newToOut.innovationNumber, selectedConnection.recurrent, this.config);

    this.connectionGenes.push(connection1);
    this.connectionGenes.push(connection2);
  }

  /**
   * Checks if a connection between two nodes is recurrent.
   * A connection is recurrent if it creates a cycle in the network.
   * @param {NodeGene} fromNode - The source node of the potential connection.
   * @param {NodeGene} toNode - The target node of the potential connection.
   * @returns {boolean} True if the connection is recurrent, false otherwise.
   */
  checkIfRecurrent(fromNode, toNode) {
    let recurrent = false;

    if (fromNode === toNode) {
      recurrent = true;
      return recurrent;
    }

    if (fromNode instanceof OutputNode) {
      recurrent = true;
      return recurrent;
    }

    /** @type {NodeGene[]} */
    let stack = [];
    let visited = new Set();

    stack.push(toNode);

    while (stack.length > 0) {
      let currentNode = /** @type {NodeGene} */ (stack.pop());
      if (currentNode === fromNode) {
        recurrent = true;
        return recurrent;
      }
      if (!currentNode.acceptsOutgoingConnections()) {
        continue;
      }
      visited.add(currentNode);
      /** @ts-ignore */
      for (let connection of currentNode.outgoingConnections) {
        let nextNode = connection.outNode;
        if (!connection.recurrent && !visited.has(nextNode)) {
          stack.push(nextNode);
        }
      }
    }
    return recurrent;
  }

  /**
   * Updates the recurrent flag for all connections in the genome.
   */
  checkForRecurrentConnections() {
    this.connectionGenes.forEach(connection => {
      connection.recurrent = this.checkIfRecurrent(connection.inNode, connection.outNode);
    });
  }

  /**
   * Reinitializes all connection weights according to the 
   * weight initialization method in the configuration.
   */
  reinitializeWeights() {
    for (const connection of this.connectionGenes) {
      connection.reinitializeWeight();
    }
  }

  /**
   * Creates a deep copy of the genome with the same structure 
   * and weights but as a separate object.
   * @returns {Genome} A new genome identical to the original
   */
  copy() {
    /** @type {NodeGene[]} */
    const newNodes = [];
    /** @type {ConnectionGene[]} */
    const newConnections = [];
    /** @type {Record<number, NodeGene>} */
    const nodeMapping = {};

    this.nodeGenes.forEach(node => {
      let newNode = null;
      if (node instanceof InputNode) {
        newNode = new InputNode(node.id, this.config);
      } else if (node instanceof HiddenNode) {
        newNode = new HiddenNode(node.id, this.config);
      } else if (node instanceof OutputNode) {
        newNode = new OutputNode(node.id, this.config);
      } else if (node instanceof BiasNode) {
        newNode = new BiasNode(node.id, this.config);
      }
      if (newNode !== null) {
        newNodes.push(newNode);
        nodeMapping[newNode.id] = newNode;
      }
    });

    this.connectionGenes.forEach(connection => {
      const originalInNode = connection.inNode;
      const originalOutNode = connection.outNode;
      const newInNode = nodeMapping[originalInNode.id];
      const newOutNode = nodeMapping[originalOutNode.id];

      if (newInNode && newOutNode) {
        const newConnection = new ConnectionGene(
          newInNode,
          newOutNode,
          connection.weight,
          connection.enabled,
          connection.innovationNumber,
          connection.recurrent,
          this.config
        );
        newConnections.push(newConnection);
      }
    });

    return new Genome(newNodes, newConnections, this.config, this.populationId);
  }

  /**
   * Compares this genome with another to check if they are 
   * structurally and parametrically identical.
   * @param {Genome} genome - The genome to compare with
   * @returns {boolean} True if the genomes are identical, false otherwise
   */
  equalsGenome(genome) {
    if (
      this.nodeGenes.length !== genome.nodeGenes.length ||
      this.connectionGenes.length !== genome.connectionGenes.length
    ) {
      return false;
    }

    for (let i = 0; i < this.connectionGenes.length; i++) {
      if (this.connectionGenes[i].weight !== genome.connectionGenes[i].weight) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a genetic encoding representation of this genome.
   * @returns {GeneticEncoding} The genetic encoding of this genome.
   */
  getGeneticEncoding() {
    const geneticEncoding = new GeneticEncoding(this.config, this.populationId);
    geneticEncoding.loadGenome(this);

    return geneticEncoding;
  }

  /**
   * Performs crossover between this genome and another parent genome 
   * to create an offspring. Genes are inherited from both parents 
   * according to their fitness values.
   * @param {Genome} parent2 - The second parent genome
   * @returns {Genome} A new genome created from the genetic material of both parents
   */
  crossover(parent2) {
    const parent1Encoding = this.getGeneticEncoding();
    const parent2Encoding = parent2.getGeneticEncoding();

    const offspring = parent1Encoding.crossover(parent2Encoding);
    const offspringGenome = offspring.buildGenome();

    return offspringGenome;
  }

  /**
   * Evaluates the genome's fitness using the fitness function specified in 
   * the configuration. If no fitness function is provided, fitness must 
   * be assigned manually.
   */
  evaluateFitness() {
    this.fitness = this.config.fitnessFunction.calculateFitness(this);
  }

  /**
   * Converts the genome to a JSON string representation for storage or transmission.
   * @returns {string} JSON string representation of the genome
   */
  toJSON() {
    const jsonGenome = {
      id: this.id,
      nodeGenes: this.nodeGenes.map(node => ({
        id: node.id,
        /** @ts-ignore */
        type: node.nodeType
      })),
      connectionGenes: this.connectionGenes.map(connection => ({
        innovationNumber: connection.innovationNumber,
        inNodeId: connection.inNode.id,
        outNodeId: connection.outNode.id,
        enabled: connection.enabled,
        weight: connection.weight,
        recurrent: connection.recurrent
      })),
      fitness: this.fitness,
      populationId: this.populationId
    };

    return JSON.stringify(jsonGenome, null, 2);
  }

  /**
   * Removes disconnected hidden nodes and disabled connections from the 
   * genome to optimize its structure. This can be useful after learning 
   * a given task to minimize the network size.
   * @param {boolean} removeDisabledConnections - If true, also removes disabled connections.
   */
  prune(removeDisabledConnections = false) {
    if (removeDisabledConnections) {
      const disabledConnections = this.connectionGenes.filter(conn => !conn.enabled);
      
      for (const connection of disabledConnections) {
        const inNode = connection.inNode;
        const outNode = connection.outNode;
        
        /** @ts-ignore */
        const inNodeOutgoingIndex = inNode.outgoingConnections.indexOf(connection);
        if (inNodeOutgoingIndex !== -1) {
          /** @ts-ignore */
          inNode.outgoingConnections.splice(inNodeOutgoingIndex, 1);
        }
        
        /** @ts-ignore */
        const outNodeIncomingIndex = outNode.incomingConnections.indexOf(connection);
        if (outNodeIncomingIndex !== -1) {
          /** @ts-ignore */
          outNode.incomingConnections.splice(outNodeIncomingIndex, 1);
        }
        
        /** @ts-ignore */
        if (connection.recurrent && outNode.inComingRecurrentConnections) {
          /** @ts-ignore */
          const recurrentIndex = outNode.inComingRecurrentConnections.indexOf(connection);
          if (recurrentIndex !== -1) {
            /** @ts-ignore */
            outNode.inComingRecurrentConnections.splice(recurrentIndex, 1);
          }
        }
        
        /** @ts-ignore */
        if (outNode.biasConnection === connection) {
          /** @ts-ignore */
          outNode.biasConnection = null;
        }
      }
      
      this.connectionGenes = this.connectionGenes.filter(conn => conn.enabled);
    }
    
    let nodesPruned = true;
    
    while (nodesPruned) {
      nodesPruned = false;
      
      for (let i = 0; i < this.nodeGenes.length; i++) {
        const node = this.nodeGenes[i];
        
        if (!(node instanceof HiddenNode)) {
          continue;
        }
        
        const incomingConnections = node.incomingConnections;
        const outgoingConnections = node.outgoingConnections;
        
        if (incomingConnections.length === 0) {
          for (const conn of outgoingConnections) {
            const targetNode = conn.outNode;
            /** @ts-ignore */
            const targetIncomingIndex = targetNode.incomingConnections.indexOf(conn);
            if (targetIncomingIndex !== -1) {
              /** @ts-ignore */
              targetNode.incomingConnections.splice(targetIncomingIndex, 1);
            }
            
            /** @ts-ignore */
            if (conn.recurrent && targetNode.inComingRecurrentConnections) {
              /** @ts-ignore */
              const recurrentIndex = targetNode.inComingRecurrentConnections.indexOf(conn);
              if (recurrentIndex !== -1) {
                /** @ts-ignore */
                targetNode.inComingRecurrentConnections.splice(recurrentIndex, 1);
              }
            }
            
            /** @ts-ignore */
            if (targetNode.biasConnection === conn) {
              /** @ts-ignore */
              targetNode.biasConnection = null;
            }
          }
          
          /** @ts-ignore */
          this.connectionGenes = this.connectionGenes.filter(conn => !outgoingConnections.includes(conn));
          
          this.nodeGenes.splice(i, 1);
          nodesPruned = true;
          i--;
        } else if (outgoingConnections.length === 0) {
          for (const conn of incomingConnections) {
            const sourceNode = conn.inNode;
            /** @ts-ignore */
            const sourceOutgoingIndex = sourceNode.outgoingConnections.indexOf(conn);
            if (sourceOutgoingIndex !== -1) {
              /** @ts-ignore */
              sourceNode.outgoingConnections.splice(sourceOutgoingIndex, 1);
            }
          }
          /** @ts-ignore */
          this.connectionGenes = this.connectionGenes.filter(conn => !incomingConnections.includes(conn));
          
          this.nodeGenes.splice(i, 1);
          nodesPruned = true;
          i--;
        }
      }
    }
  }
}

module.exports = Genome;
