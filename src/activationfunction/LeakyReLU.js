const ActivationFunction = require('./ActivationFunction');
class LeakyReLU extends ActivationFunction {
  constructor(alpha = 0.01) {
    super();
    this.alpha = alpha;
  }
  
  apply(value) {
    return value > 0 ? value : this.alpha * value;
  }
}
module.exports = LeakyReLU;