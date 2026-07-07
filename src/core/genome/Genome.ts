import { InputNode } from './genes/nodegene/InputNode';
import { HiddenNode } from './genes/nodegene/HiddenNode';
import { BiasNode } from './genes/nodegene/BiasNode';
import { OutputNode } from './genes/nodegene/OutputNode';
import { ConnectionGene } from './genes/connectiongene/ConnectionGene';
import StaticManager from '../../util/StaticManager';
import { GeneticEncoding } from './genes/geneticencoding/GeneticEncoding';
import type { Config } from '../../config/Config';
import type { NodeGene, SourceNode, TargetNode } from './genes/nodegene/NodeGene';
import type { NodeType } from './genes/nodegene/NodeType';
import type { GenomeTracker } from '../../util/trackers/GenomeTracker';
import type { NodeTracker } from '../../util/trackers/NodeTracker';
import type { InnovationTracker } from '../../util/trackers/InnovationTracker';

/** Serialized form of a node gene. */
export interface NodeGeneJSON {
  id: number;
  type: NodeType;
}

/** Serialized form of a connection gene. */
export interface ConnectionGeneJSON {
  innovationNumber: number;
  inNodeId: number;
  outNodeId: number;
  enabled: boolean;
  weight: number;
  recurrent: boolean;
}

/** Serialized form of a genome, as produced by {@link Genome#toJSON}. */
export interface GenomeJSON {
  id: number;
  nodeGenes: NodeGeneJSON[];
  connectionGenes: ConnectionGeneJSON[];
  fitness: number;
  populationId: number;
}

/**
 * The Genome class is the core genetic representation in NEAT.
 * It encodes the structure and parameters of a neural network,
 * including nodes (neurons) and connections between them. Each
 * genome can be expressed as a neural network for evaluation,
 * and can undergo genetic operations like mutation and crossover.
 */
export class Genome {
  nodeGenes: NodeGene[];
  connectionGenes: ConnectionGene[];
  inputNodes: InputNode[];
  outputNodes: OutputNode[];
  biasNode: BiasNode | null;
  config: Config;
  genomeTracker: GenomeTracker;
  nodeTracker: NodeTracker;
  innovationTracker: InnovationTracker;
  id: number;
  fitness = 0;
  adjustedFitness = 0;
  populationId: number;

  /**
   * Creates a new genome with the specified nodes, connections, configuration, and population ID.
   * @param nodeGenes - Array of node genes (InputNode, HiddenNode, OutputNode, BiasNode)
   * @param connectionGenes - Array of connection genes
   * @param config - Configuration parameters for the genome
   * @param populationId - ID of the population this genome belongs to
   */
  constructor(nodeGenes: NodeGene[], connectionGenes: ConnectionGene[], config: Config, populationId: number) {
    this.nodeGenes = nodeGenes;
    this.connectionGenes = connectionGenes;
    this.inputNodes = nodeGenes.filter(node => node instanceof InputNode);
    this.outputNodes = nodeGenes.filter(node => node instanceof OutputNode);
    this.biasNode = nodeGenes.find(node => node instanceof BiasNode) ?? null;
    this.config = config;
    this.genomeTracker = StaticManager.getGenomeTracker(populationId);
    this.nodeTracker = StaticManager.getNodeTracker(populationId);
    this.innovationTracker = StaticManager.getInnovationTracker(populationId);
    this.id = this.genomeTracker.getNextGenomeId();
    this.populationId = populationId;
  }

  /**
   * Activates the neural network represented by the genome with
   * the given inputs and returns the outputs.
   * @param inputs - Array of input values for the network
   * @returns Array of output values produced by the network
   */
  propagate(inputs: readonly number[]): number[] {
    this.calculateExpectedInputs();
    for (let i = 0; i < inputs.length; i++) {
      // By construction, ids 0..inputSize-1 are the input nodes.
      const inputNode = this.getNodeById(i) as InputNode;
      inputNode.feedInput(inputs[i]);
    }

    const outputs = new Array<number>(this.outputNodes.length);
    for (let i = 0; i < this.outputNodes.length; i++) {
      const outputNode = this.getNodeById(i + this.inputNodes.length) as OutputNode;
      outputs[i] = outputNode.lastOutput;
    }

    return outputs;
  }

  /**
   * Resets the internal state of all nodes in the network.
   * This is particularly useful when working with recurrent networks.
   */
  resetState(): void {
    for (const node of this.nodeGenes) {
      node.resetState();
    }
  }

  /**
   * Calculates the expected number of inputs for each node in the network.
   */
  calculateExpectedInputs(): void {
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
   * @param nodeid - The ID of the node to find.
   * @returns The node with the given ID, or null if not found.
   */
  getNodeById(nodeid: number): NodeGene | null {
    return this.nodeGenes.find(node => node.id === nodeid) ?? null;
  }

  /**
   * Applies random mutations to the genome according to the
   * rates defined in the configuration. Mutations can include
   * weight changes, adding connections, or adding nodes.
   */
  mutate(): void {
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
  mutateWeights(): void {
    const minWeight = this.config.minWeight;
    const maxWeight = this.config.maxWeight;

    for (const connection of this.connectionGenes) {
      if (Math.random() < this.config.reinitializeWeightRate) {
        connection.reinitializeWeight();
      } else {
        const weight = connection.weight;
        const perturb = this.config.minPerturb + (this.config.maxPerturb - this.config.minPerturb) * Math.random();
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
  mutateAddConnection(): void {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const fromNode = this.nodeGenes[Math.floor(Math.random() * this.nodeGenes.length)];
      const toNode = this.nodeGenes[Math.floor(Math.random() * this.nodeGenes.length)];

      if (!fromNode.acceptsOutgoingConnections() || !toNode.acceptsIncomingConnections()) {
        attempts++;
        continue;
      }

      let connectionExists = false;
      for (const connection of this.connectionGenes) {
        if (connection.inNode === fromNode && connection.outNode === toNode) {
          connectionExists = true;
          break;
        }
      }

      if (connectionExists) {
        attempts++;
        continue;
      }

      const isRecurrent = this.checkIfRecurrent(fromNode, toNode);
      const recurrentConnectionRate = this.config.recurrentConnectionRate;
      const allowRecurrentConnections = this.config.allowRecurrentConnections;

      if (isRecurrent) {
        if (!allowRecurrentConnections || Math.random() > recurrentConnectionRate) {
          attempts++;
          continue;
        }
      }

      const innovationData = this.innovationTracker.trackInnovation(fromNode.id, toNode.id);

      const newConnection = new ConnectionGene(
        fromNode,
        toNode,
        this.config.weightInitialization.initializeWeight(),
        true,
        innovationData.innovationNumber,
        isRecurrent,
        this.config
      );
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
  mutateAddNode(): void {
    if (this.connectionGenes.length < 1) {
      return;
    }

    let selectedConnection: ConnectionGene | null = null;
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const potentialConnection = this.connectionGenes[Math.floor(Math.random() * this.connectionGenes.length)];
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
    const newNode = new HiddenNode(innovations.newNodeId, this.config);
    this.nodeGenes.push(newNode);

    const connection1 = new ConnectionGene(
      selectedConnection.inNode,
      newNode,
      1,
      true,
      innovations.inToNew.innovationNumber,
      false,
      this.config
    );
    const connection2 = new ConnectionGene(
      newNode,
      selectedConnection.outNode,
      selectedConnection.weight,
      true,
      innovations.newToOut.innovationNumber,
      selectedConnection.recurrent,
      this.config
    );

    this.connectionGenes.push(connection1);
    this.connectionGenes.push(connection2);
  }

  /**
   * Checks if a connection between two nodes is recurrent.
   * A connection is recurrent if it creates a cycle in the network.
   * @param fromNode - The source node of the potential connection.
   * @param toNode - The target node of the potential connection.
   * @returns True if the connection is recurrent, false otherwise.
   */
  checkIfRecurrent(fromNode: NodeGene, toNode: NodeGene): boolean {
    if (fromNode === toNode) {
      return true;
    }

    if (fromNode instanceof OutputNode) {
      return true;
    }

    const stack: NodeGene[] = [];
    const visited = new Set<NodeGene>();

    stack.push(toNode);

    while (stack.length > 0) {
      const currentNode = stack.pop()!;
      if (currentNode === fromNode) {
        return true;
      }
      if (!currentNode.acceptsOutgoingConnections()) {
        continue;
      }
      visited.add(currentNode);
      for (const connection of currentNode.outgoingConnections) {
        const nextNode = connection.outNode;
        if (!connection.recurrent && !visited.has(nextNode)) {
          stack.push(nextNode);
        }
      }
    }
    return false;
  }

  /**
   * Updates the recurrent flag for all connections in the genome.
   */
  checkForRecurrentConnections(): void {
    this.connectionGenes.forEach(connection => {
      connection.recurrent = this.checkIfRecurrent(connection.inNode, connection.outNode);
    });
  }

  /**
   * Reinitializes all connection weights according to the
   * weight initialization method in the configuration.
   */
  reinitializeWeights(): void {
    for (const connection of this.connectionGenes) {
      connection.reinitializeWeight();
    }
  }

  /**
   * Creates a deep copy of the genome with the same structure
   * and weights but as a separate object.
   * @returns A new genome identical to the original
   */
  copy(): Genome {
    const newNodes: NodeGene[] = [];
    const newConnections: ConnectionGene[] = [];
    const nodeMapping: Record<number, NodeGene> = {};

    this.nodeGenes.forEach(node => {
      let newNode: NodeGene | null = null;
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
          newInNode as SourceNode,
          newOutNode as TargetNode,
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
   * @param genome - The genome to compare with
   * @returns True if the genomes are identical, false otherwise
   */
  equalsGenome(genome: Genome): boolean {
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
   * @returns The genetic encoding of this genome.
   */
  getGeneticEncoding(): GeneticEncoding {
    const geneticEncoding = new GeneticEncoding(this.config, this.populationId);
    geneticEncoding.loadGenome(this);

    return geneticEncoding;
  }

  /**
   * Performs crossover between this genome and another parent genome
   * to create an offspring. Genes are inherited from both parents
   * according to their fitness values.
   * @param parent2 - The second parent genome
   * @returns A new genome created from the genetic material of both parents
   */
  crossover(parent2: Genome): Genome {
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
  evaluateFitness(): void {
    this.fitness = this.config.fitnessFunction.calculateFitness(this);
  }

  /**
   * Converts the genome to a JSON string representation for storage or transmission.
   * @returns JSON string representation of the genome
   */
  toJSON(): string {
    const jsonGenome: GenomeJSON = {
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

  /**
   * Removes disconnected hidden nodes and disabled connections from the
   * genome to optimize its structure. This can be useful after learning
   * a given task to minimize the network size.
   * @param removeDisabledConnections - If true, also removes disabled connections.
   */
  prune(removeDisabledConnections = false): void {
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
