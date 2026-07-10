import { HiddenNode } from '../nodegene/HiddenNode';
import { OutputNode } from '../nodegene/OutputNode';
import type { Config } from '../../../../config/Config';
import type { SourceNode, TargetNode } from '../nodegene/NodeGene';

/**
 * Represents a connection gene in a NEAT genome.
 *
 * Generic over its endpoint node types so specialized connections
 * (e.g. a bias connection, `ConnectionGene<BiasNode>`) retain precise
 * endpoint typing.
 */
export class ConnectionGene<
  TIn extends SourceNode = SourceNode,
  TOut extends TargetNode = TargetNode
> {
  forwardedExpectedInput = false;

  /**
   * Creates a new connection gene.
   * @param inNode - The source node of the connection.
   * @param outNode - The target node of the connection.
   * @param weight - The weight of the connection.
   * @param enabled - Whether the connection is enabled.
   * @param innovationNumber - The unique innovation number for this connection.
   * @param recurrent - Whether this is a recurrent connection.
   * @param config - The configuration object.
   */
  constructor(
    public inNode: TIn,
    public outNode: TOut,
    public weight: number,
    public enabled: boolean,
    public innovationNumber: number,
    public recurrent: boolean,
    public config: Config
  ) {
    inNode.addOutgoingConnection(this);
    outNode.addIncomingConnection(this);
  }

  /**
   * Feeds the input forward through this connection to the output node.
   * @param input - The input value to propagate.
   */
  feedForward(input: number): void {
    if (this.enabled && !this.recurrent) {
      this.outNode.feedInput(input * this.weight);
    }
  }

  forwardExpectedInput(): void {
    if (this.forwardedExpectedInput) {
      return;
    }
    if (this.outNode instanceof HiddenNode) {
      this.outNode.forwardExpectedInput();
    } else if (this.outNode instanceof OutputNode) {
      this.outNode.forwardExpectedInput();
    }
    this.forwardedExpectedInput = true;
  }

  /**
   * Reinitializes the connection weight using the configured weight initialization strategy.
   */
  reinitializeWeight(): void {
    this.weight = this.config.weightInitialization.initializeWeight();
  }
}
