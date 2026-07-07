import { ConnectionGeneData } from './ConnectionGeneData';
import { NodeGeneData } from './NodeGeneData';
import { InputNode } from '../nodegene/InputNode';
import { HiddenNode } from '../nodegene/HiddenNode';
import { OutputNode } from '../nodegene/OutputNode';
import { BiasNode } from '../nodegene/BiasNode';
import { ConnectionGene } from '../connectiongene/ConnectionGene';
import { NodeType } from '../nodegene/NodeType';
import { Genome } from '../../Genome';
import type { Config } from '../../../../config/Config';
import type { AnyNodeGene, SourceNode, TargetNode } from '../nodegene/NodeGene';

/**
 * Represents the genetic encoding of a genome
 */
export class GeneticEncoding {
  nodeGenesMap = new Map<number, NodeGeneData>();
  connectionGenesMap = new Map<number, ConnectionGeneData>();
  inputNodes: NodeGeneData[] = [];
  outputNodes: NodeGeneData[] = [];
  biasNode: NodeGeneData | null = null;
  fitness = 0;

  /**
   * Creates a new GeneticEncoding instance.
   * @param config - The configuration object.
   * @param populationId - The ID of the population this encoding belongs to.
   */
  constructor(public config: Config, public populationId: number) {}

  /**
   * Load genome
   * @param genome - The genome to load data from.
   */
  loadGenome(genome: Genome): void {
    this.nodeGenesMap.clear();
    this.connectionGenesMap.clear();

    for (const connection of genome.connectionGenes) {
      this.connectionGenesMap.set(
        connection.innovationNumber,
        new ConnectionGeneData(
          connection.inNode.id,
          connection.outNode.id,
          connection.weight,
          connection.enabled,
          connection.innovationNumber,
          connection.recurrent
        )
      );
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

  /**
   * Performs crossover between this encoding and another parent encoding.
   * Genes are inherited from the fitter parent, with matching genes randomly selected.
   * @param otherParent - The other parent for crossover.
   * @returns A new GeneticEncoding representing the offspring.
   */
  crossover(otherParent: GeneticEncoding): GeneticEncoding {
    const offspring = new GeneticEncoding(this.config, this.populationId);
    const thisFitness = this.fitness;
    const otherFitness = otherParent.fitness;

    let bestParent: GeneticEncoding;
    let worstParent: GeneticEncoding;
    if (thisFitness > otherFitness) {
      bestParent = this;
      worstParent = otherParent;
    } else if (otherFitness > thisFitness) {
      bestParent = otherParent;
      worstParent = this;
    } else {
      bestParent = this.connectionGenesMap.size < otherParent.connectionGenesMap.size ? this : otherParent;
      worstParent = this.connectionGenesMap.size < otherParent.connectionGenesMap.size ? otherParent : this;
    }

    for (const [innovationNumber, currentGene] of bestParent.connectionGenesMap) {
      if (worstParent.hasInnovationNumber(innovationNumber)) {
        const parent2Gene = worstParent.getConnectionByInnovationNumber(innovationNumber);
        const selectedParent = Math.random() < 0.5 ? bestParent : worstParent;
        const selectedGene = selectedParent.getConnectionByInnovationNumber(innovationNumber);
        let isEnabled = !currentGene.enabled || !parent2Gene.enabled
          ? Math.random() > this.config.keepDisabledOnCrossOverRate
          : true;

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

  /**
   * Calculates the compatibility distance between this encoding and another.
   * Used for speciation to determine if two genomes belong to the same species.
   * @param otherParent - The other encoding to compare with.
   * @returns The compatibility distance value.
   */
  calculateCompatibilityDistance(otherParent: GeneticEncoding): number {
    const disjointGenes = this.getNumberOfDisjointGenes(otherParent);
    const excessGenes = this.getNumberOfExcessGenes(otherParent);
    let maxGenes = Math.max(this.connectionGenesMap.size, otherParent.connectionGenesMap.size);
    maxGenes = maxGenes < 20 ? 1 : maxGenes;
    return (
      (this.config.c1 * excessGenes) / maxGenes +
      (this.config.c2 * disjointGenes) / maxGenes +
      this.config.c3 * this.calculateAverageWeightDifference(otherParent)
    );
  }

  /**
   * Counts the number of matching genes between this encoding and another.
   * @param otherParent - The other encoding to compare with.
   * @returns The count of matching genes.
   */
  getNumberOfMatchingGenes(otherParent: GeneticEncoding): number {
    let matchingGenes = 0;
    for (const innovationNumber of this.connectionGenesMap.keys()) {
      if (otherParent.hasInnovationNumber(innovationNumber)) {
        matchingGenes++;
      }
    }
    return matchingGenes;
  }

  /**
   * Counts the number of disjoint genes between this encoding and another.
   * Disjoint genes are non-matching genes within the range of both genomes' innovation numbers.
   * @param otherParent - The other encoding to compare with.
   * @returns The count of disjoint genes.
   */
  getNumberOfDisjointGenes(otherParent: GeneticEncoding): number {
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

  /**
   * Counts the number of excess genes between this encoding and another.
   * Excess genes are genes in the larger genome that exceed the innovation number range of the smaller genome.
   * @param otherParent - The other encoding to compare with.
   * @returns The count of excess genes.
   */
  getNumberOfExcessGenes(otherParent: GeneticEncoding): number {
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

  /**
   * Calculates the average weight difference between matching genes.
   * @param otherParent - The other encoding to compare with.
   * @returns The average absolute weight difference of matching genes.
   */
  calculateAverageWeightDifference(otherParent: GeneticEncoding): number {
    let totalWeightDifference = 0;
    let matchingGenesCount = 0;

    for (const [innovationNumber, connection] of this.connectionGenesMap) {
      if (otherParent.hasInnovationNumber(innovationNumber)) {
        const otherGene = otherParent.getConnectionByInnovationNumber(innovationNumber);
        const weightDifference = Math.abs(connection.weight - otherGene.weight);
        totalWeightDifference += weightDifference;
        matchingGenesCount++;
      }
    }
    if (matchingGenesCount === 0) {
      return 0;
    }
    return totalWeightDifference / matchingGenesCount;
  }

  /**
   * Builds a new Genome instance from this genetic encoding.
   * Creates new node and connection gene objects based on the stored data.
   * @returns A new Genome instance.
   */
  buildGenome(): Genome {
    const newNodeGenesMap = new Map<number, AnyNodeGene>();
    const newNodeGenes: AnyNodeGene[] = [];

    for (const oldNode of this.nodeGenesMap.values()) {
      let newNode: AnyNodeGene | null = null;
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

    const newConnectionGenes: ConnectionGene[] = [];

    for (const oldConnection of this.connectionGenesMap.values()) {
      const newInNode = newNodeGenesMap.get(oldConnection.inNodeId) as SourceNode;
      const newOutNode = newNodeGenesMap.get(oldConnection.outNodeId) as TargetNode;

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

  /**
   * Adds a connection and its associated nodes to this encoding.
   * @param connection - The connection data to add.
   * @param enabled - Whether the connection should be enabled.
   * @param parent - The parent encoding to get node types from.
   * @param bestParent - The best parent encoding.
   */
  addConnectionAndNodes(
    connection: ConnectionGeneData,
    enabled: boolean,
    parent: GeneticEncoding,
    bestParent: GeneticEncoding
  ): void {
    const outNodeType = parent.getNodeById(connection.outNodeId).nodeType;
    if (outNodeType === NodeType.INPUT) {
      throw new Error(`Invalid connection: Input node ${connection.outNodeId} cannot be used as out node.`);
    }
    const bestParentConnection = bestParent.getConnectionByInnovationNumber(connection.innovationNumber);
    const newConnection = new ConnectionGeneData(
      connection.inNodeId,
      connection.outNodeId,
      connection.weight,
      enabled,
      connection.innovationNumber,
      bestParentConnection.recurrent
    );

    this.addConnection(newConnection);

    const inNode = new NodeGeneData(connection.inNodeId, parent.getNodeById(connection.inNodeId).nodeType);
    const outNode = new NodeGeneData(connection.outNodeId, parent.getNodeById(connection.outNodeId).nodeType);

    this.addNode(inNode);
    this.addNode(outNode);
  }

  /**
   * Gets the highest innovation number in this encoding.
   * @returns The highest innovation number, or 0 if no connections exist.
   */
  getHighestInnovationNumber(): number {
    const highestInnovationNumber = Math.max(...Array.from(this.connectionGenesMap.keys()), 0);
    return highestInnovationNumber;
  }

  /**
   * Checks if this encoding contains a connection with the given innovation number.
   * @param innovationNumber - The innovation number to check.
   * @returns True if the innovation number exists in this encoding.
   */
  hasInnovationNumber(innovationNumber: number): boolean {
    return this.connectionGenesMap.has(innovationNumber);
  }

  /**
   * Gets a node by its ID.
   * @param id - The node ID.
   * @returns The node data.
   * @throws {Error} If the node ID does not exist.
   */
  getNodeById(id: number): NodeGeneData {
    const node = this.nodeGenesMap.get(id);
    if (node === undefined) {
      throw new Error(`Error: Node with ID ${id} does not exist.`);
    }
    return node;
  }

  /**
   * Gets a connection by its innovation number.
   * @param innovationNumber - The innovation number.
   * @returns The connection data.
   */
  getConnectionByInnovationNumber(innovationNumber: number): ConnectionGeneData {
    return this.connectionGenesMap.get(innovationNumber)!;
  }

  /**
   * Adds a connection to this encoding if it doesn't already exist.
   * Connections with the same in/out node pair are not duplicated.
   * @param connection - The connection data to add.
   */
  addConnection(connection: ConnectionGeneData): void {
    for (const existingConnection of this.connectionGenesMap.values()) {
      if (
        existingConnection.inNodeId === connection.inNodeId &&
        existingConnection.outNodeId === connection.outNodeId
      ) {
        return;
      }
    }
    this.connectionGenesMap.set(connection.innovationNumber, connection);
  }

  /**
   * Checks if this encoding contains a node with the given ID.
   * @param nodeId - The node ID to check.
   * @returns True if the node ID exists in this encoding.
   */
  hasNodeId(nodeId: number): boolean {
    return this.nodeGenesMap.has(nodeId);
  }

  /**
   * Adds a node to this encoding if it doesn't already exist.
   * @param node - The node data to add.
   */
  addNode(node: NodeGeneData): void {
    if (this.nodeGenesMap.has(node.id)) {
      return;
    }
    this.nodeGenesMap.set(node.id, node);

    switch (node.nodeType) {
      case NodeType.INPUT:
        this.inputNodes.push(node);
        break;
      case NodeType.OUTPUT:
        this.outputNodes.push(node);
        break;
      case NodeType.BIAS:
        this.biasNode = node;
        break;
    }
  }
}
