const NodeGene = require('./NodeGene');
const BiasNode = require('./BiasNode');
const NodeType = require('./NodeType');

class HiddenNode extends NodeGene {
  constructor(id, config) {
    super(id, config);
    this.nodeType = NodeType.HIDDEN;
    this.activationFunction = config.activationFunction;
    this.incomingConnections = [];
    this.outgoingConnections = [];
    this.inComingRecurrentConnections = [];
    this.biasConnection = null;
    this.inputs = [];
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
    return true;
  }
}

module.exports = HiddenNode;