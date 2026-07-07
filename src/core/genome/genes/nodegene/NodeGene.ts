import { NodeType } from './NodeType';
import type { Config } from '../../../../config/Config';
import type { InputNode } from './InputNode';
import type { HiddenNode } from './HiddenNode';
import type { OutputNode } from './OutputNode';
import type { BiasNode } from './BiasNode';

/** Union of every concrete node gene class. Discriminated by {@link NodeGene#nodeType}. */
export type AnyNodeGene = InputNode | HiddenNode | OutputNode | BiasNode;

/** Nodes that can be the source (`inNode`) of a connection. */
export type SourceNode = InputNode | HiddenNode | BiasNode;

/** Nodes that can be the target (`outNode`) of a connection. */
export type TargetNode = HiddenNode | OutputNode;

/**
 * Abstract base class for all node genes in a NEAT genome.
 */
export abstract class NodeGene {
  /** Discriminant identifying the concrete node kind. */
  abstract readonly nodeType: NodeType;

  lastOutput = 0;
  expectedInputs = 0;
  receivedInputs = 0;

  /**
   * Creates a new NodeGene instance.
   * @param id - The unique identifier for this node.
   * @param config - The configuration object.
   */
  constructor(public id: number, public config: Config) {}

  /**
   * Resets the node's state
   */
  resetState(): void {
    this.lastOutput = 0;
    this.expectedInputs = 0;
    this.receivedInputs = 0;
  }

  /**
   * Indicates whether this node type can accept incoming connections.
   * Acts as a type guard narrowing the node to {@link TargetNode}.
   * @returns True if this node can receive connections, false otherwise.
   */
  acceptsIncomingConnections(): this is TargetNode {
    return this.nodeType === NodeType.HIDDEN || this.nodeType === NodeType.OUTPUT;
  }

  /**
   * Indicates whether this node type can accept outgoing connections.
   * Acts as a type guard narrowing the node to {@link SourceNode}.
   * @returns True if this node can send connections, false otherwise.
   */
  acceptsOutgoingConnections(): this is SourceNode {
    return this.nodeType !== NodeType.OUTPUT;
  }
}
