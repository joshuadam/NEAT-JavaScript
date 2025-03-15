class PopulationTracker {
  static #populationId = 0;

  static getNextPopulationId() {
    return this.#populationId++;
  }
}

module.exports = PopulationTracker;