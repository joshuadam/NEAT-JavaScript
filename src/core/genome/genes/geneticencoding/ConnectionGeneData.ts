/**
 * Object representing a connection gene's properties.
 */
export class ConnectionGeneData {
  /**
   * Creates a new ConnectionGeneData instance.
   * @param inNodeId - The ID of the input (source) node.
   * @param outNodeId - The ID of the output (target) node.
   * @param weight - The connection weight.
   * @param enabled - Whether the connection is enabled.
   * @param innovationNumber - The innovation number of this connection.
   * @param recurrent - Whether this is a recurrent connection.
   */
  constructor(
    public inNodeId: number,
    public outNodeId: number,
    public weight: number,
    public enabled: boolean,
    public innovationNumber: number,
    public recurrent: boolean
  ) {}
}
