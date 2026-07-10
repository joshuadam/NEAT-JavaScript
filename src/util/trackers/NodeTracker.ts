/**
 * Tracks and generates unique node IDs for a population.
 */
export class NodeTracker {
  private nodeId = 0;

  /**
   * Gets the next unique node ID and increments the counter.
   * @returns The next available node ID.
   */
  getNextNodeId(): number {
    return this.nodeId++;
  }
}
