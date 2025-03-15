const StaticManager = require('../StaticManager');

class InnovationTracker {
  static InnovationType = Object.freeze({
    addConnection: 'addConnection',
    addNode: 'addNode'
  });
  constructor() {
    this.innovationMap = new Map();
    this.innovationCounter = 0;
  }

  reset() {
    this.innovationMap.clear();
  }

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

  generateMutationKey(innovationType, inNodeId, outNodeId) {
    return `${innovationType}-${inNodeId}-${outNodeId}`;
  }
}

module.exports = InnovationTracker;