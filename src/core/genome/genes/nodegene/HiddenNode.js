const NodeGene = require('./NodeGene');
const BiasNode = require('./BiasNode');
const NodeType = require('./NodeType');

/** @typedef {import('../../../../config/Config')} Config */
/** @typedef {import('../connectiongene/ConnectionGene')} ConnectionGene */
/** @typedef {import('../../../../activationfunction/ActivationFunction')} ActivationFunction */

/**
 * Represents a hidden node in a NEAT neural network.
 */
class HiddenNode extends NodeGene {
  /**
   * Creates a new hidden node.
   * @param {number} id - The unique identifier for this node.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    super(id, config);
    /** @type {'HIDDEN'} */
    this.nodeType = NodeType.HIDDEN;
    /** @type {ActivationFunction} */
    this.activationFunction = config.activationFunction;
    /** @type {ConnectionGene[]} */
    this.incomingConnections = [];
    /** @type {ConnectionGene[]} */
    this.outgoingConnections = [];
    /** @type {ConnectionGene[]} */
    this.inComingRecurrentConnections = [];
    /** @type {ConnectionGene|null} */
    this.biasConnection = null;
    /** @type {number[]} */
    this.inputs = [];
  }

  /**
   * Receives an input value from an incoming connection.
   * When all expected inputs are received, triggers activation.
   * @param {number} input - The input value from a connection.
   */
  feedInput(input) {
    this.inputs.push(input);
    this.receivedInputs++;
    if (this.receivedInputs === this.expectedInputs) {
      this.activate(this.inputs);
    }
  }

  /**
   * Activates the node
   * @param {number[]} inputs - Array of input values from incoming connections.
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
          /** @ts-ignore */
          sum += this.biasConnection.weight * this.biasConnection.inNode.bias;
        }
        break;
      case 'DIRECT_NODE':
        if (this.biasConnection !== null && this.biasConnection.enabled) {
        /** @ts-ignore */
        sum += this.biasConnection.inNode.bias;
        }
        break;
      case 'CONSTANT':
        sum += this.config.bias;
        break;
      case 'DISABLED':
        break;
    }
    const output = this.activationFunction.apply(sum);
    this.lastOutput = output;
    for (const connection of this.outgoingConnections) {
      connection.feedForward(output);
    }
    this.inputs = [];
    this.receivedInputs = 0;
  }

  forwardExpectedInput() {
    this.expectedInputs++;
    for (const connection of this.outgoingConnections) {
      if (connection.enabled && !connection.recurrent) {
        connection.forwardExpectedInput();
      }
    }
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
   * @returns {boolean} Always returns true for hidden nodes.
   */
  acceptsIncomingConnections() {
    return true;
  }

  /**
   * Indicates whether this node can accept outgoing connections.
   * @returns {boolean} Always returns true for hidden nodes.
   */
  acceptsOutgoingConnections() {
    return true;
  }
}

module.exports = HiddenNode;
