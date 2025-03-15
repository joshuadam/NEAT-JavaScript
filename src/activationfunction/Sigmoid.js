const ActivationFunction = require('./ActivationFunction');

class Sigmoid extends ActivationFunction {
  apply(value) {
    return 1 / (1 + Math.exp(-value));
  }
}

module.exports = Sigmoid;