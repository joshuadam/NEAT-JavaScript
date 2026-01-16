/** @typedef {import('../../../../config/Config')} Config */

/**
 * Abstract base class for all node genes in a NEAT genome.
 * @abstract
 */
class NodeGene {
  /**
   * Creates a new NodeGene instance.
   * @param {number} id - The unique identifier for this node.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    /** @type {number} */
    this.id = id;
    /** @type {Config} */
    this.config = config;
    /** @type {number} */
    this.lastOutput = 0;
    /** @type {number} */
    this.expectedInputs = 0;
    /** @type {number} */
    this.receivedInputs = 0;
  }

  /**
   * Resets the node's state
   */
  resetState() {
    this.lastOutput = 0;
    this.expectedInputs = 0;
    this.receivedInputs = 0;
  }

  /**
   * Indicates whether this node type can accept incoming connections.
   * @returns {boolean} True if this node can receive connections, false otherwise.
   */
  acceptsIncomingConnections() {
    return false;
  }

  /**
   * Indicates whether this node type can accept outgoing connections.
   * @returns {boolean} True if this node can send connections, false otherwise.
   */
  acceptsOutgoingConnections() {
    return false;
  }
}

module.exports = NodeGene;
