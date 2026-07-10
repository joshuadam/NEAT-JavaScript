import { NodeGene } from './NodeGene';
import { NodeType } from './NodeType';
import type { Config } from '../../../../config/Config';
import type { ConnectionGene } from '../connectiongene/ConnectionGene';

/**
 * Represents an input node in a NEAT neural network.
 */
export class InputNode extends NodeGene {
  readonly nodeType = NodeType.INPUT;
  outgoingConnections: ConnectionGene[] = [];

  /**
   * Creates a new input node.
   * @param id - The unique identifier for this node.
   * @param config - The configuration object.
   */
  constructor(id: number, config: Config) {
    super(id, config);
  }

  /**
   * Feeds an input value into this node, triggering activation.
   * @param input - The input value to feed into the node.
   */
  feedInput(input: number): void {
    this.activate(input);
  }

  /**
   * Activates the node by propagating the input through all outgoing connections.
   * @param input - The input value to propagate.
   */
  activate(input: number): void {
    for (const connection of this.outgoingConnections) {
      connection.feedForward(input);
      this.lastOutput = input;
    }
  }

  calculateExpectedInputs(): void {
    for (const connection of this.outgoingConnections) {
      if (connection.enabled && !connection.recurrent) {
        connection.forwardExpectedInput();
      }
    }
  }

  /**
   * Adds an outgoing connection from this node.
   * @param connection - The connection to add.
   */
  addOutgoingConnection(connection: ConnectionGene): void {
    this.outgoingConnections.push(connection);
  }
}
