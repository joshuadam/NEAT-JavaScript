class NodeGene {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.lastOutput = 0;
    this.expectedInputs = 0;
    this.receivedInputs = 0;
  }

  resetState() {
    this.lastOutput = 0;
    this.expectedInputs = 0;
    this.receivedInputs = 0;
  }

  acceptsIncomingConnections() {
    return false;
  }

  acceptsOutgoingConnections() {
    return false;
  }
}

module.exports = NodeGene;