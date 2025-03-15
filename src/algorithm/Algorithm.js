const Population = require('../core/population/Population');

class Algorithm {
  constructor(config) {
    this.config = config;
    this.population = new Population(config);
  }

  run() {
    this.population.evaluatePopulation();
      for (let i = 0; i < this.config.generations; i++) {
        this.population.evolve();
        this.population.evaluatePopulation();
        let bestFitness = this.population.getBestGenome().fitness;

        console.log('Generation: ' + this.population.generation + ' best fitness: ' + bestFitness);
        if (bestFitness >= this.config.targetFitness) {
          console.log('Target fitness reached');
          break;
        }
      }
  }
}

module.exports = Algorithm;