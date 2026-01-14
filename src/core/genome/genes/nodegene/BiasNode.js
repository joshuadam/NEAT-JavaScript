const NodeGene = require('./NodeGene');
const NodeType = require('./NodeType');

/** @typedef {import('../../../../config/Config')} Config */
/** @typedef {import('../connectiongene/ConnectionGene')} ConnectionGene */

/**
 * Represents a bias node in a NEAT neural network.
 */
class BiasNode extends NodeGene {
  /**
   * Creates a new BiasNode instance.
   * @param {number} id - The unique identifier for this node.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    super(id, config);
    /** @type {'BIAS'} */
    this.nodeType = NodeType.BIAS;
    /** @type {number} */
    this.bias = config.bias;
    /** @type {number} */
    this.lastOutput = this.bias;
    /** @type {ConnectionGene[]} */
    this.outgoingConnections = [];
  }

  /**
   * Activation is not supported for bias nodes.
   * @param {number[]} inputs - The inputs (not used).
   * @throws {Error} Always throws an error as bias nodes cannot be activated.
   */
  activate(inputs) {
    throw new Error("Bias node cannot be activated");
  }

  /**
   * Feeding input is not supported for bias nodes.
   * @param {number} input - The input value (not used).
   * @throws {Error} Always throws an error as bias nodes do not accept input.
   */
  feedInput(input) {
    throw new Error("Bias node does not have any input");
  }

  /**
   * Adds an outgoing connection from this bias node.
   * @param {ConnectionGene} connection - The connection to add.
   */
  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  /**
   * Indicates whether this node accepts outgoing connections.
   * @returns {boolean} Always returns true for bias nodes.
   */
  acceptsOutgoingConnections() {
    return true;
  }
}

module.exports = BiasNode;
