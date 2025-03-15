const NodeGene = require('./NodeGene');
const BiasNode = require('./BiasNode');
const NodeType = require('./NodeType');

class OutputNode extends NodeGene {
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

  feedInput(input) {
    this.inputs.push(input);
    this.receivedInputs++;
    if (this.receivedInputs === this.expectedInputs) {
      this.activate(this.inputs);
    }
  }

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

  forwardExpectedInput() {
    this.expectedInputs++;
  }

  addIncomingConnection(connection) {
    this.incomingConnections.push(connection);
    if (connection.recurrent) {
      this.inComingRecurrentConnections.push(connection);
    }
    if (connection.inNode instanceof BiasNode) {
      this.biasConnection = connection;
    }
  }

  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  acceptsIncomingConnections() {
    return true;
  }

  acceptsOutgoingConnections() {
    return false;
  }
}

module.exports = OutputNode;