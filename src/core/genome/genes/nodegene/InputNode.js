const NodeGene = require('./NodeGene');
const NodeType = require('./NodeType');

class InputNode extends NodeGene {

  constructor(id, config) {
    super(id, config);
    this.outgoingConnections = [];
    this.nodeType = NodeType.INPUT;
  }

  feedInput(input) {
    this.activate(input);
  }

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

  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  acceptsOutgoingConnections() {
    return true;
  }

}

module.exports = InputNode;