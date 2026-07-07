import type { NodeType } from '../nodegene/NodeType';

/**
 * Lightweight data class representing node gene information
 */
export class NodeGeneData {
  /**
   * Creates a new NodeGeneData instance.
   * @param id - The unique identifier
   * @param nodeType - The type of node ('INPUT', 'OUTPUT', 'HIDDEN', or 'BIAS').
   */
  constructor(public id: number, public nodeType: NodeType) {}
}
