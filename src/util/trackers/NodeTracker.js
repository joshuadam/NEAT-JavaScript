/**
 * Tracks and generates unique node IDs for a population.
 */
class NodeTracker {
  /**
   * Creates a new NodeTracker instance.
   * Initializes the node ID counter to 0.
   */
  constructor() {
    /** @type {number} */
    this.nodeId = 0;
  }

  /**
   * Gets the next unique node ID and increments the counter.
   * @returns {number} The next available node ID.
   */
  getNextNodeId() {
    return this.nodeId++;
  }
}

module.exports = NodeTracker;
