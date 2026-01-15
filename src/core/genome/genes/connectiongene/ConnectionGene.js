const HiddenNode = require('../nodegene/HiddenNode');
const OutputNode = require('../nodegene/OutputNode');

/** @typedef {import('../../../../config/Config')} Config */
/** @typedef {import('../nodegene/NodeGene')} NodeGene */

/**
 * Represents a connection gene in a NEAT genome.
 */
class ConnectionGene {
  /**
   * Creates a new connection gene.
   * @param {NodeGene} inNode - The source node of the connection.
   * @param {NodeGene} outNode - The target node of the connection.
   * @param {number} weight - The weight of the connection.
   * @param {boolean} enabled - Whether the connection is enabled.
   * @param {number} innovationNumber - The unique innovation number for this connection.
   * @param {boolean} recurrent - Whether this is a recurrent connection.
   * @param {Config} config - The configuration object.
   */
  constructor(inNode, outNode, weight, enabled, innovationNumber, recurrent, config) {
    /** @type {NodeGene} */
    this.inNode = inNode;
    /** @type {NodeGene} */
    this.outNode = outNode;
    /** @type {number} */
    this.weight = weight;
    /** @type {boolean} */
    this.enabled = enabled;
    /** @type {number} */
    this.innovationNumber = innovationNumber;
    /** @type {boolean} */
    this.recurrent = recurrent;
    /** @type {Config} */
    this.config = config;
    /** @type {boolean} */
    this.forwardedExpectedInput = false;

    /** @ts-ignore */
    inNode.addOutgoingConnection(this);
    /** @ts-ignore */
    outNode.addIncomingConnection(this);
  }

  /**
   * Feeds the input forward through this connection to the output node.
   * @param {number} input - The input value to propagate.
   */
  feedForward(input) {
    if (this.enabled && !this.recurrent) {
      /** @ts-ignore */
      this.outNode.feedInput(input * this.weight);
    }
  }

  forwardExpectedInput() {
    if (this.forwardedExpectedInput) {
      return;
    }
    if (this.outNode instanceof HiddenNode) {
      let node = this.outNode;
      node.forwardExpectedInput();
    } else if (this.outNode instanceof OutputNode) {
      let node = this.outNode;
      node.forwardExpectedInput();
    }
    this.forwardedExpectedInput = true;
  }

  /**
   * Reinitializes the connection weight using the configured weight initialization strategy.
   */
  reinitializeWeight() {
    this.weight = this.config.weightInitialization.initializeWeight();
  }
}

module.exports = ConnectionGene;
