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
    this.inNode = inNode;
    this.outNode = outNode;
    this.weight = weight;
    this.enabled = enabled;
    this.innovationNumber = innovationNumber;
    this.recurrent = recurrent;
    this.config = config;
    this.forwardedExpectedInput = false;

    inNode.addOutgoingConnection(this);
    outNode.addIncomingConnection(this);
  }

  /**
   * Feeds the input forward through this connection to the output node.
   * @param {number} input - The input value to propagate.
   */
  feedForward(input) {
    if (this.enabled && !this.recurrent) {
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