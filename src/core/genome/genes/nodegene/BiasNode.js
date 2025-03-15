const NodeGene = require('./NodeGene');
const NodeType = require('./NodeType');

class BiasNode extends NodeGene {
  constructor(id, config) {
    super(id, config);
    this.nodeType = NodeType.BIAS;
    this.bias = config.bias;
    this.lastOutput = this.bias;
    this.outgoingConnections = [];
  }

  activate(inputs) {
    throw new Error("Bias node cannot be activated");
  }

  feedInput(input) {
    throw new Error("Bias node does not have any input");
  }

  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }

  acceptsOutgoingConnections() {
    return true;
  }
}

module.exports = BiasNode;