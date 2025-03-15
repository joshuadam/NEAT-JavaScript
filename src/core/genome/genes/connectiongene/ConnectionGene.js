const HiddenNode = require('../nodegene/HiddenNode');
const OutputNode = require('../nodegene/OutputNode');

class ConnectionGene {
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

  reinitializeWeight() {
    this.weight = this.config.weightInitialization.initializeWeight();
  }
}

module.exports = ConnectionGene;