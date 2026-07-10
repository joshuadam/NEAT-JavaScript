import { NodeGene } from './NodeGene';
import { BiasNode } from './BiasNode';
import { NodeType } from './NodeType';
import type { Config } from '../../../../config/Config';
import type { ConnectionGene } from '../connectiongene/ConnectionGene';
import type { ActivationFunction } from '../../../../activationfunction/ActivationFunction';

/**
 * Represents a hidden node in a NEAT neural network.
 */
export class HiddenNode extends NodeGene {
  readonly nodeType = NodeType.HIDDEN;
  activationFunction: ActivationFunction;
  incomingConnections: ConnectionGene[] = [];
  outgoingConnections: ConnectionGene[] = [];
  inComingRecurrentConnections: ConnectionGene[] = [];
  biasConnection: ConnectionGene<BiasNode> | null = null;
  inputs: number[] = [];

  /**
   * Creates a new hidden node.
   * @param id - The unique identifier for this node.
   * @param config - The configuration object.
   */
  constructor(id: number, config: Config) {
    super(id, config);
    this.activationFunction = config.activationFunction;
  }

  /**
   * Receives an input value from an incoming connection.
   * When all expected inputs are received, triggers activation.
   * @param input - The input value from a connection.
   */
  feedInput(input: number): void {
    this.inputs.push(input);
    this.receivedInputs++;
    if (this.receivedInputs === this.expectedInputs) {
      this.activate(this.inputs);
    }
  }

  /**
   * Activates the node
   * @param inputs - Array of input values from incoming connections.
   */
  activate(inputs: number[]): void {
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

  forwardExpectedInput(): void {
    this.expectedInputs++;
    for (const connection of this.outgoingConnections) {
      if (connection.enabled && !connection.recurrent) {
        connection.forwardExpectedInput();
      }
    }
  }

  /**
   * Adds an incoming connection to this node.
   * @param connection - The incoming connection to add.
   */
  addIncomingConnection(connection: ConnectionGene): void {
    this.incomingConnections.push(connection);
    if (connection.recurrent) {
      this.inComingRecurrentConnections.push(connection);
    }
    if (connection.inNode instanceof BiasNode) {
      this.biasConnection = connection as ConnectionGene<BiasNode>;
    }
  }

  /**
   * Adds an outgoing connection from this node.
   * @param connection - The outgoing connection to add.
   */
  addOutgoingConnection(connection: ConnectionGene): void {
    this.outgoingConnections.push(connection);
  }
}
