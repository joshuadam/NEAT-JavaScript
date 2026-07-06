/**
 * Lightweight data class representing node gene information
 */
class NodeGeneData {
  /**
   * Creates a new NodeGeneData instance.
   * @param {number} id - The unique identifier
   * @param {'INPUT' | 'OUTPUT' | 'HIDDEN' | 'BIAS'} nodeType - The type of node ('INPUT', 'OUTPUT', 'HIDDEN', or 'BIAS').
   */
  constructor(id, nodeType) {
    this.id = id;
    this.nodeType = nodeType;
  }
}

module.exports = NodeGeneData;