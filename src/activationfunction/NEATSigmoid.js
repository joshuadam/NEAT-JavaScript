const ActivationFunction = require('./ActivationFunction');

class NEATSigmoid extends ActivationFunction {
  constructor(steepness = 4.9) {
    super();
    this.steepness = steepness;
  }
  
  apply(value) {
    return 1 / (1 + Math.exp(-this.steepness * value));
  }
}

module.exports = NEATSigmoid;