class ActivationFunction {
  apply(value) {
    throw new Error('Apply has to be implemented by a subclass');
  }
}

module.exports = ActivationFunction;