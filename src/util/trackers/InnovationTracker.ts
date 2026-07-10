import StaticManager from '../StaticManager';
import type { ConnectionGene } from '../../core/genome/genes/connectiongene/ConnectionGene';

/** Record describing a tracked structural innovation. */
export interface InnovationData {
  inNodeId: number;
  outNodeId: number;
  innovationNumber: number;
}

/** Result of tracking an add-node innovation. */
export interface AddNodeInnovation {
  inToNew: InnovationData;
  newToOut: InnovationData;
  newNodeId: number;
}

const InnovationTypes = Object.freeze({
  addConnection: 'addConnection',
  addNode: 'addNode'
} as const);

/** The kinds of structural innovation that are tracked. */
export type InnovationType = (typeof InnovationTypes)[keyof typeof InnovationTypes];

/** Template-literal key uniquely identifying a mutation. */
export type MutationKey = `${InnovationType}-${number}-${number}`;

/**
 * Tracks innovation numbers
 */
export class InnovationTracker {
  static readonly InnovationType = InnovationTypes;

  /**
   * addConnection keys map to {@link InnovationData}; addNode keys map to the
   * new node's id. The key prefix keeps the two namespaces disjoint.
   */
  private readonly innovationMap = new Map<MutationKey, InnovationData | number>();
  private innovationCounter = 0;

  /**
   * Discards all tracked innovations.
   */
  reset(): void {
    this.innovationMap.clear();
  }

  /**
   * Tracks an innovation
   * @param inNodeId - The ID of the source node.
   * @param outNodeId - The ID of the target node.
   * @returns The innovation data for this connection, reused if seen before.
   */
  trackInnovation(inNodeId: number, outNodeId: number): InnovationData {
    const mutationKey = this.generateMutationKey(InnovationTypes.addConnection, inNodeId, outNodeId);

    const existing = this.innovationMap.get(mutationKey);
    if (existing !== undefined) {
      return existing as InnovationData;
    }
    const innovationData: InnovationData = {
      inNodeId: inNodeId,
      outNodeId: outNodeId,
      innovationNumber: this.innovationCounter
    };

    this.innovationMap.set(mutationKey, innovationData);
    this.innovationCounter++;
    return innovationData;
  }

  /**
   * Tracks an innovation for adding a new node
   * @param existingConnection - The connection being split by the new node.
   * @param populationId - The population the innovation belongs to.
   * @returns The innovations for both new connections and the new node's id.
   */
  trackAddNodeInnovation(existingConnection: ConnectionGene, populationId: number): AddNodeInnovation {
    const nodeTracker = StaticManager.getNodeTracker(populationId);
    const mutationKey = this.generateMutationKey(
      InnovationTypes.addNode,
      existingConnection.inNode.id,
      existingConnection.outNode.id
    );
    let newNodeId: number;

    if (this.innovationMap.has(mutationKey)) {
      newNodeId = this.innovationMap.get(mutationKey) as number;
    } else {
      newNodeId = nodeTracker.getNextNodeId();
      this.innovationMap.set(mutationKey, newNodeId);
    }

    const sourceNodeId = existingConnection.inNode.id;
    const targetNodeId = existingConnection.outNode.id;

    const inToNewInnovation = this.trackInnovation(sourceNodeId, newNodeId);
    const newToOutInnovation = this.trackInnovation(newNodeId, targetNodeId);

    return {
      inToNew: inToNewInnovation,
      newToOut: newToOutInnovation,
      newNodeId: newNodeId
    };
  }

  /**
   * Generates a unique key for identifying a mutation.
   * @param innovationType - The type of innovation.
   * @param inNodeId - The ID of the source node.
   * @param outNodeId - The ID of the target node.
   * @returns A unique key string for this mutation.
   */
  generateMutationKey(innovationType: InnovationType, inNodeId: number, outNodeId: number): MutationKey {
    return `${innovationType}-${inNodeId}-${outNodeId}`;
  }
}
