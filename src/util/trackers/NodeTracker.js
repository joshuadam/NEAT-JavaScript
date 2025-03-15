class NodeTracker {
  constructor() {
    this.nodeId = 0;
  }

  getNextNodeId() {
    return this.nodeId++;
  }
}

module.exports = NodeTracker;