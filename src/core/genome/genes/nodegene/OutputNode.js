const NodeGene = require('./NodeGene');
const BiasNode = require('./BiasNode');
const NodeType = require('./NodeType');

/** @typedef {import('../../../../config/Config')} Config */
/** @typedef {import('../connectiongene/ConnectionGene')} ConnectionGene */

/**
 * Represents an output node in the neural network.
 */
class OutputNode extends NodeGene {
  /**
   * Creates a new output node.
   * @param {number} id - The unique identifier for this node.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    super(id, config);
    this.nodeType = NodeType.OUTPUT;
    this.activationFunction = config.activationFunction;
    this.incomingConnections = [];
    this.inComingRecurrentConnections = [];
    this.outgoingConnections = [];
    this.biasConnection = null;
    this.inputs = [];
    this.numInputsReceived = 0;
  }

  /**
   * Receives an input value and triggers activation when all expected inputs are received.
   * @param {number} input - The input value received from an incoming connection.
   */
  feedInput(input) {
    this.inputs.push(input);
    this.receivedInputs++;
    if (this.receivedInputs === this.expectedInputs) {
      this.activate(this.inputs);
    }
  }

  /**
   * Activates the output node by summing all inputs and applying the activation function.
   * Handles recurrent connections and bias based on the configured bias mode.
   * @param {number[]} inputs - Array of input values to sum.
   */
  activate(inputs) {
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i];
    }
    for (const connection of this.inComingRecurrentConnections) {
      if (connection.enabled) {
        sum += connection.inNode.lastOutput * connection.weight;
      }
    }
    switch (this.config.biasMode) {
      case 'WEIGHTED_NODE':
        if (this.biasConnection !== null && this.biasConnection.enabled) {
          sum += this.biasConnection.weight * this.biasConnection.inNode.bias;
        }
        break;
      case 'DIRECT_NODE':
        if (this.biasConnection !== null && this.biasConnection.enabled) {
        sum += this.biasConnection.inNode.bias;
        }
        break;
      case 'CONSTANT':
        sum += this.config.bias;
        break;
      case 'DISABLED':
        break;
    }
    this.lastOutput = this.activationFunction.apply(sum);
    this.inputs = [];
    this.receivedInputs = 0;
  }

  /**
   * Increments the expected input count for this node.
   */
  forwardExpectedInput() {
    this.expectedInputs++;
  }

  /**
   * Adds an incoming connection to this node.
   * @param {ConnectionGene} connection - The incoming connection to add.
   */
  addIncomingConnection(connection) {
    this.incomingConnections.push(connection);
    if (connection.recurrent) {
      this.inComingRecurrentConnections.push(connection);
    }
    if (connection.inNode instanceof BiasNode) {
      this.biasConnection = connection;
    }
  }

  /**
   * Adds an outgoing connection from this node.
   * @param {ConnectionGene} connection - The outgoing connection to add.
   */
  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  /**
   * Indicates whether this node can accept incoming connections.
   * @returns {boolean} - Always returns true for output nodes.
   */
  acceptsIncomingConnections() {
    return true;
  }

  /**
   * Indicates whether this node can have outgoing connections.
   * @returns {boolean} - Always returns false for output nodes.
   */
  acceptsOutgoingConnections() {
    return false;
  }
}

module.exports = OutputNode;