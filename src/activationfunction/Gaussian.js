const ActivationFunction = require('./ActivationFunction');

class Gaussian extends ActivationFunction {
  constructor(center = 0, width = 1) {
    super();
    this.center = center;
    this.width = width;
  }
  
  apply(value) {
    return Math.exp(-Math.pow((value - this.center) / this.width, 2));
  }
}

module.exports = Gaussian;