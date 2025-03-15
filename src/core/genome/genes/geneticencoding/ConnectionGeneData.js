class ConnectionGeneData {
  constructor(inNodeId, outNodeId, weight, enabled, innovationNumber, recurrent) {
    this.inNodeId = inNodeId;
    this.outNodeId = outNodeId;
    this.weight = weight;
    this.enabled = enabled;
    this.innovationNumber = innovationNumber;
    this.recurrent = recurrent;
  }
}

module.exports = ConnectionGeneData;