const ActivationFunction = require('./ActivationFunction');

class Tanh extends ActivationFunction {
  apply(value) {
    return Math.tanh(value);
  }
}

module.exports = Tanh;