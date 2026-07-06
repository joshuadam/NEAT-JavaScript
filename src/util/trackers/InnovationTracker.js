const StaticManager = require('../StaticManager');

/** @typedef {import('../../core/genome/genes/connectiongene/ConnectionGene')} ConnectionGene */

/**
 * Tracks innovation numbers
 */
class InnovationTracker {
  static InnovationType = Object.freeze({
    addConnection: 'addConnection',
    addNode: 'addNode'
  });

  /**
   * @typedef {Object} InnovationData
   * @property {number} inNodeId
   * @property {number} outNodeId
   * @property {number} innovationNumber
   */

  /**
   * Creates a new InnovationTracker instance.
   */
  constructor() {
    this.innovationMap = new Map();
    this.innovationCounter = 0;
  }

  /**
   * Discards all tracked innovations.
   */
  reset() {
    this.innovationMap.clear();
  }

  /**
   * Tracks an innovation
   * @param {number} inNodeId
   * @param {number} outNodeId
   * @returns {InnovationData}
   */
  trackInnovation(inNodeId, outNodeId) {
    const mutationKey = this.generateMutationKey(InnovationTracker.InnovationType.addConnection, inNodeId, outNodeId);
    
    if (this.innovationMap.has(mutationKey)) {
      return this.innovationMap.get(mutationKey);
    } else {
      const innovationData = {
        inNodeId: inNodeId,
        outNodeId: outNodeId,
        innovationNumber: this.innovationCounter
      };
      
      this.innovationMap.set(mutationKey, innovationData);
      this.innovationCounter++;
      return innovationData;
    }
  }

  /**
   * Tracks an innovation for adding a new node
   * @param {ConnectionGene} existingConnection
   * @param {number} populationId
   * @returns {{inToNew: InnovationData, newToOut: InnovationData, newNodeId: number}}
   */
  trackAddNodeInnovation(existingConnection, populationId) {
    const nodeTracker = StaticManager.getNodeTracker(populationId);
    const mutationKey = this.generateMutationKey(InnovationTracker.InnovationType.addNode, existingConnection.inNode.id, existingConnection.outNode.id);
    let newNodeId = null;

    if (this.innovationMap.has(mutationKey)) {
      newNodeId = this.innovationMap.get(mutationKey);
    } else {
      newNodeId = nodeTracker.getNextNodeId();
      this.innovationMap.set(mutationKey, newNodeId);
    }

    const sourceNodeId = existingConnection.inNode.id;
    const targetNodeId = existingConnection.outNode.id;

    const inToNewInnovation = this.trackInnovation(
      sourceNodeId, 
      newNodeId
    );

    const newToOutInnovation = this.trackInnovation(
      newNodeId, 
      targetNodeId
    );

    return {
      inToNew: inToNewInnovation,
      newToOut: newToOutInnovation,
      newNodeId: newNodeId
    };
  }

  /**
   * Generates a unique key for identifying a mutation.
   * @param {string} innovationType - The type of innovation (from InnovationType enum).
   * @param {number} inNodeId - The ID of the source node.
   * @param {number} outNodeId - The ID of the target node.
   * @returns {string} A unique key string for this mutation.
   */
  generateMutationKey(innovationType, inNodeId, outNodeId) {
    return `${innovationType}-${inNodeId}-${outNodeId}`;
  }
}

module.exports = InnovationTracker;