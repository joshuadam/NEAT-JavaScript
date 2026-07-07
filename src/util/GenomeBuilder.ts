import StaticManager from './StaticManager';
import { PopulationTracker } from './trackers/PopulationTracker';
import { Genome } from '../core/genome/Genome';
import { InputNode } from '../core/genome/genes/nodegene/InputNode';
import { HiddenNode } from '../core/genome/genes/nodegene/HiddenNode';
import { OutputNode } from '../core/genome/genes/nodegene/OutputNode';
import { BiasNode } from '../core/genome/genes/nodegene/BiasNode';
import { ConnectionGene } from '../core/genome/genes/connectiongene/ConnectionGene';
import type { Config } from '../config/Config';
import type { NodeGene, SourceNode, TargetNode } from '../core/genome/genes/nodegene/NodeGene';
import type { GenomeJSON } from '../core/genome/Genome';

/**
 * This class provides a convenient way to create genomes with
 * a standard topology determined by your configuration settings. This
 * approach is recommended for initializing populations with consistent
 * starting topologies.
 */
export class GenomeBuilder {
  /**
   * Creates a new genome with input and output nodes
   * connected according to the configuration parameters.
   * @param config - Configuration object containing parameters for genome creation
   * @param populationId - ID of the population this genome belongs to
   * @returns A new genome with the specified topology
   */
  static buildGenome(config: Config, populationId: number = PopulationTracker.getNextPopulationId()): Genome {
    const numInputs = config.inputSize;
    const numOutputs = config.outputSize;

    const nodeGenes: NodeGene[] = [];
    const connectionGenes: ConnectionGene[] = [];

    for (let i = 0; i < numInputs; i++) {
      nodeGenes.push(new InputNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config));
    }

    for (let i = 0; i < numOutputs; i++) {
      nodeGenes.push(new OutputNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config));
    }

    let biasNode: BiasNode | null = null;
    if (config.biasMode !== 'DISABLED' && config.biasMode !== 'CONSTANT') {
      biasNode = new BiasNode(StaticManager.getNodeTracker(populationId).getNextNodeId(), config);
      nodeGenes.push(biasNode);
    }

    for (let inputIdx = 0; inputIdx < numInputs; inputIdx++) {
      // By construction, the first numInputs entries are input nodes and the
      // following numOutputs entries are output nodes.
      const inputNode = nodeGenes[inputIdx] as InputNode;

      for (let outputIdx = numInputs; outputIdx < numInputs + numOutputs; outputIdx++) {
        const outputNode = nodeGenes[outputIdx] as OutputNode;
        const innovationData = StaticManager.getInnovationTracker(populationId)
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
      }
    }

    if (config.connectBias && config.biasMode !== 'DISABLED' && config.biasMode !== 'CONSTANT') {
      for (let outputIdx = numInputs; outputIdx < numInputs + numOutputs; outputIdx++) {
        const outputNode = nodeGenes[outputIdx] as OutputNode;
        const innovationData = StaticManager.getInnovationTracker(populationId)
          .trackInnovation(biasNode!.id, outputNode.id);

        connectionGenes.push(new ConnectionGene(
          biasNode!,
          outputNode,
          config.weightInitialization.initializeWeight(),
          true,
          innovationData.innovationNumber,
          false,
          config
        ));
      }
    }
    return new Genome(nodeGenes, connectionGenes, config, populationId);
  }

  /**
   * Recreates a genome from its JSON representation.
   * @param jsonData - JSON string representation of a genome
   * @param config - Configuration parameters for the genome
   * @returns A reconstructed genome with the same structure and weights
   * @throws {Error} If the JSON contains an unknown node type or invalid connection references.
   */
  static loadGenome(jsonData: string, config: Config): Genome {
    const parsedData = JSON.parse(jsonData) as GenomeJSON;

    const nodeGenes: NodeGene[] = [];

    parsedData.nodeGenes.forEach(nodeData => {
      let node: NodeGene;
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
          throw new Error(`Unknown node type: ${(nodeData as { type: string }).type}`);
      }
      nodeGenes.push(node);
    });

    const connectionGenes: ConnectionGene[] = [];

    parsedData.connectionGenes.forEach(connData => {
      const inNode = nodeGenes.find(node => node.id === connData.inNodeId);
      const outNode = nodeGenes.find(node => node.id === connData.outNodeId);

      if (!inNode || !outNode) {
        throw new Error('Connection refers to a non-existing node');
      }

      const connection = new ConnectionGene(
        inNode as SourceNode,
        outNode as TargetNode,
        connData.weight,
        connData.enabled,
        connData.innovationNumber,
        connData.recurrent,
        config
      );
      connectionGenes.push(connection);
    });

    const genome = new Genome(nodeGenes, connectionGenes, config, parsedData.populationId);
    genome.fitness = parsedData.fitness;

    return genome;
  }
}
