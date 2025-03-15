const ActivationFunction = require('./ActivationFunction');
class SELU extends ActivationFunction {
  constructor() {
    super();
    this.alpha = 1.6732632423543772848170429916717;
    this.scale = 1.0507009873554804934193349852946;
  }
  
  apply(value) {
    return this.scale * (value > 0 ? value : this.alpha * (Math.exp(value) - 1));
  }
}
module.exports = SELU;