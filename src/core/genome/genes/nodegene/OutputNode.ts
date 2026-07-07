import { NodeGene } from './NodeGene';
import { BiasNode } from './BiasNode';
import { NodeType } from './NodeType';
import type { Config } from '../../../../config/Config';
import type { ConnectionGene } from '../connectiongene/ConnectionGene';
import type { ActivationFunction } from '../../../../activationfunction/ActivationFunction';

/**
 * Represents an output node in the neural network.
 */
export class OutputNode extends NodeGene {
  readonly nodeType = NodeType.OUTPUT;
  activationFunction: ActivationFunction;
  incomingConnections: ConnectionGene[] = [];
  inComingRecurrentConnections: ConnectionGene[] = [];
  outgoingConnections: ConnectionGene[] = [];
  biasConnection: ConnectionGene<BiasNode> | null = null;
  inputs: number[] = [];
  numInputsReceived = 0;

  /**
   * Creates a new output node.
   * @param id - The unique identifier for this node.
   * @param config - The configuration object.
   */
  constructor(id: number, config: Config) {
    super(id, config);
    this.activationFunction = config.activationFunction;
  }

  /**
   * Receives an input value and triggers activation when all expected inputs are received.
   * @param input - The input value received from an incoming connection.
   */
  feedInput(input: number): void {
    this.inputs.push(input);
    this.receivedInputs++;
    if (this.receivedInputs === this.expectedInputs) {
      this.activate(this.inputs);
    }
  }

  /**
   * Activates the output node by summing all inputs and applying the activation function.
   * Handles recurrent connections and bias based on the configured bias mode.
   * @param inputs - Array of input values to sum.
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
    this.lastOutput = this.activationFunction.apply(sum);
    this.inputs = [];
    this.receivedInputs = 0;
  }

  /**
   * Increments the expected input count for this node.
   */
  forwardExpectedInput(): void {
    this.expectedInputs++;
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
