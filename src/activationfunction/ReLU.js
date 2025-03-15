const ActivationFunction = require('./ActivationFunction');
class ReLU extends ActivationFunction {
  apply(value) {
    return Math.max(0, value);
  }
}
module.exports = ReLU;