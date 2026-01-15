/**
 * Object representing a connection gene's properties.
 */
class ConnectionGeneData {
  /**
   * Creates a new ConnectionGeneData instance.
   * @param {number} inNodeId - The ID of the input (source) node.
   * @param {number} outNodeId - The ID of the output (target) node.
   * @param {number} weight - The connection weight.
   * @param {boolean} enabled - Whether the connection is enabled.
   * @param {number} innovationNumber - The innovation number of this connection.
   * @param {boolean} recurrent - Whether this is a recurrent connection.
   */
  constructor(inNodeId, outNodeId, weight, enabled, innovationNumber, recurrent) {
    /** @type {number} */
    this.inNodeId = inNodeId;
    /** @type {number} */
    this.outNodeId = outNodeId;
    /** @type {number} */
    this.weight = weight;
    /** @type {boolean} */
    this.enabled = enabled;
    /** @type {number} */
    this.innovationNumber = innovationNumber;
    /** @type {boolean} */
    this.recurrent = recurrent;
  }
}

module.exports = ConnectionGeneData;
