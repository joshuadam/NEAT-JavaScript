import { NodeGene } from './NodeGene';
import { NodeType } from './NodeType';
import type { Config } from '../../../../config/Config';
import type { ConnectionGene } from '../connectiongene/ConnectionGene';

/**
 * Represents a bias node in a NEAT neural network.
 */
export class BiasNode extends NodeGene {
  readonly nodeType = NodeType.BIAS;
  bias: number;
  outgoingConnections: ConnectionGene[] = [];

  /**
   * Creates a new BiasNode instance.
   * @param id - The unique identifier for this node.
   * @param config - The configuration object.
   */
  constructor(id: number, config: Config) {
    super(id, config);
    this.bias = config.bias;
    this.lastOutput = this.bias;
  }

  /**
   * Activation is not supported for bias nodes.
   * @param inputs - The inputs (not used).
   * @throws {Error} Always throws an error as bias nodes cannot be activated.
   */
  activate(inputs: number[]): never {
    throw new Error('Bias node cannot be activated');
  }

  /**
   * Feeding input is not supported for bias nodes.
   * @param input - The input value (not used).
   * @throws {Error} Always throws an error as bias nodes do not accept input.
   */
  feedInput(input: number): never {
    throw new Error('Bias node does not have any input');
  }

  /**
   * Adds an outgoing connection from this bias node.
   * @param connection - The connection to add.
   */
  addOutgoingConnection(connection: ConnectionGene): void {
    this.outgoingConnections.push(connection);
  }
}
