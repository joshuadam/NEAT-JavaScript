const InputNode = require('./genes/nodegene/InputNode');
const HiddenNode = require('./genes/nodegene/HiddenNode');
const BiasNode = require('./genes/nodegene/BiasNode');
const OutputNode = require('./genes/nodegene/OutputNode');
const ConnectionGene = require('./genes/connectiongene/ConnectionGene');
const StaticManager = require('../../util/StaticManager');
const GeneticEncoding = require('./genes/geneticencoding/GeneticEncoding');

class Genome {
  constructor(nodeGenes, connectionGenes, config, populationId) {
    this.nodeGenes = nodeGenes;
    this.connectionGenes = connectionGenes;
    this.inputNodes = nodeGenes.filter(node => node instanceof InputNode);
    this.outputNodes = nodeGenes.filter(node => node instanceof OutputNode);
    this.biasNode = nodeGenes.find(node => node instanceof BiasNode) || null;
    this.config = config;
    this.genomeTracker = StaticManager.getGenomeTracker(populationId);
    this.nodeTracker = StaticManager.getNodeTracker(populationId);
    this.innovationTracker = StaticManager.getInnovationTracker(populationId);
    this.id = this.genomeTracker.getNextGenomeId();
    this.fitness = 0;
    this.adjustedFitness = 0;
    this.populationId = populationId;
  }

  propagate(inputs) {
    this.calculateExpectedInputs();
    for (let i = 0; i < inputs.length; i++) {
      let inputNode = this.getNodeById(i);
      inputNode.feedInput(inputs[i]);
    }

    let outputs = new Array(this.outputNodes.length);
    for (let i = 0; i < this.outputNodes.length; i++) {
      let outputNode = this.getNodeById(i + this.inputNodes.length);
      outputs[i] = outputNode.lastOutput;
    }

    return outputs;
  }

  resetState() {
    for (const node of this.nodeGenes) {
      node.resetState();
    }
  }

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

  getNodeById(nodeid) {
    return this.nodeGenes.find(node => node.id === nodeid) || null;
  }

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

  mutateWeights() {
    const minWeight = this.config.minWeight;
    const maxWeight = this.config.maxWeight;

    for (const connection of this.connectionGenes) {
      if (Math.random() < this.config.reinitializeWeightRate) {
        connection.reinitializeWeight();
      } else {
        let weight = connection.weight;
        let perturb = this.config.minPerturb + (this.config.maxPerturb - this.config.minPerturb) * Math.random();;
        let newWeight = weight + perturb;
        newWeight = Math.max(minWeight, Math.min(newWeight, maxWeight));
        connection.weight = newWeight;
      }
    }
  }

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

    let stack = [];
    let visited = new Set();

    stack.push(toNode);

    while (stack.length > 0) {
      let currentNode = stack.pop();
      if (currentNode === fromNode) {
        recurrent = true;
        return recurrent;
      }
      if (!currentNode.acceptsOutgoingConnections()) {
        continue;
      }
      visited.add(currentNode);
      for (let connection of currentNode.outgoingConnections) {
        let nextNode = connection.outNode;
        if (!connection.recurrent && !visited.has(nextNode)) {
          stack.push(nextNode);
        }
      }
    }
    return recurrent;
  }

  checkForRecurrentConnections() {
    this.connectionGenes.forEach(connection => {
      connection.recurrent = this.checkIfRecurrent(connection.inNode, connection.outNode);
    });
  }

  reinitializeWeights() {
    for (const connection of this.connectionGenes) {
      connection.reinitializeWeight();
    }
  }

  copy() {
    const newNodes = [];
    const newConnections = [];
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

  getGeneticEncoding() {
    const geneticEncoding = new GeneticEncoding(this.config, this.populationId);
    geneticEncoding.loadGenome(this);

    return geneticEncoding;
  }

  crossover(parent2) {
    const parent1Encoding = this.getGeneticEncoding();
    const parent2Encoding = parent2.getGeneticEncoding();

    const offspring = parent1Encoding.crossover(parent2Encoding);
    const offspringGenome = offspring.buildGenome();

    return offspringGenome;
  }

  evaluateFitness() {
    this.fitness = this.config.fitnessFunction.calculateFitness(this);
  }

  toJSON() {
    const jsonGenome = {
      id: this.id,
      nodeGenes: this.nodeGenes.map(node => ({
        id: node.id,
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

  prune(removeDisabledConnections = false) {
    if (removeDisabledConnections) {
      const disabledConnections = this.connectionGenes.filter(conn => !conn.enabled);
      
      for (const connection of disabledConnections) {
        const inNode = connection.inNode;
        const outNode = connection.outNode;
        
        const inNodeOutgoingIndex = inNode.outgoingConnections.indexOf(connection);
        if (inNodeOutgoingIndex !== -1) {
          inNode.outgoingConnections.splice(inNodeOutgoingIndex, 1);
        }
        
        const outNodeIncomingIndex = outNode.incomingConnections.indexOf(connection);
        if (outNodeIncomingIndex !== -1) {
          outNode.incomingConnections.splice(outNodeIncomingIndex, 1);
        }
        
        if (connection.recurrent && outNode.inComingRecurrentConnections) {
          const recurrentIndex = outNode.inComingRecurrentConnections.indexOf(connection);
          if (recurrentIndex !== -1) {
            outNode.inComingRecurrentConnections.splice(recurrentIndex, 1);
          }
        }
        
        if (outNode.biasConnection === connection) {
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
            const targetIncomingIndex = targetNode.incomingConnections.indexOf(conn);
            if (targetIncomingIndex !== -1) {
              targetNode.incomingConnections.splice(targetIncomingIndex, 1);
            }
            
            if (conn.recurrent && targetNode.inComingRecurrentConnections) {
              const recurrentIndex = targetNode.inComingRecurrentConnections.indexOf(conn);
              if (recurrentIndex !== -1) {
                targetNode.inComingRecurrentConnections.splice(recurrentIndex, 1);
              }
            }
            
            if (targetNode.biasConnection === conn) {
              targetNode.biasConnection = null;
            }
          }
          
          this.connectionGenes = this.connectionGenes.filter(conn => !outgoingConnections.includes(conn));
          
          this.nodeGenes.splice(i, 1);
          nodesPruned = true;
          i--;
        } else if (outgoingConnections.length === 0) {
          for (const conn of incomingConnections) {
            const sourceNode = conn.inNode;
            const sourceOutgoingIndex = sourceNode.outgoingConnections.indexOf(conn);
            if (sourceOutgoingIndex !== -1) {
              sourceNode.outgoingConnections.splice(sourceOutgoingIndex, 1);
            }
          }
          
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