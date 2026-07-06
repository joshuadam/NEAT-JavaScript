const NodeGene = require('./NodeGene');
const NodeType = require('./NodeType');

/** @typedef {import('../../../../config/Config')} Config */
/** @typedef {import('../connectiongene/ConnectionGene')} ConnectionGene */

/**
 * Represents an input node in a NEAT neural network.
 */
class InputNode extends NodeGene {

  /**
   * Creates a new input node.
   * @param {number} id - The unique identifier for this node.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    super(id, config);
    this.outgoingConnections = [];
    this.nodeType = NodeType.INPUT;
  }

  /**
   * Feeds an input value into this node, triggering activation.
   * @param {number} input - The input value to feed into the node.
   */
  feedInput(input) {
    this.activate(input);
  }

  /**
   * Activates the node by propagating the input through all outgoing connections.
   * @param {number} input - The input value to propagate.
   */
  activate(input) {
    for (const connection of this.outgoingConnections) {
      connection.feedForward(input);
      this.lastOutput = input;
    }
  }

  calculateExpectedInputs() {
    for (const connection of this.outgoingConnections) {
      if (connection.enabled && !connection.recurrent) {
        connection.forwardExpectedInput();
      }
    }
  }

  /**
   * Adds an outgoing connection from this node.
   * @param {ConnectionGene} connection - The connection to add.
   */
  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  /**
   * Indicates whether this node type accepts outgoing connections.
   * @returns {boolean} Always returns true for input nodes.
   */
  acceptsOutgoingConnections() {
    return true;
  }

}

module.exports = InputNode;