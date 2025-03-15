class Species {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.bestFitness = 0;
    this.generationsSinceImprovement = 0;
    this.stagnated = false;
    this.genomes = [];
    this.representative = null;
    this.offspringCount = 0;
  }

  addGenome(genome) {
    if (this.genomes.length === 0) {
      this.representative = genome;
    }
    this.genomes.push(genome);
  }

  setAdjustedFitness() {
    for (const genome of this.genomes) {
      genome.adjustedFitness = genome.fitness / this.genomes.length;
    }
  }

  removeBadGenomes() {
    this.genomes.sort((a, b) => b.fitness - a.fitness);

    const totalGenomes = this.genomes.length;
    const numberToSurvive = Math.max(1, Math.floor(totalGenomes * this.config.survivalRate));

    if (this.genomes.length > numberToSurvive) {
      this.genomes.splice(numberToSurvive, this.genomes.length - numberToSurvive);
    }
  }

  updateFitnessAndStagnation() {
    let currentBest = this.getBestGenome().fitness;
    if (currentBest > this.bestFitness) {
      this.bestFitness = currentBest;
      this.generationsSinceImprovement = 0;
    } else {
      this.generationsSinceImprovement++;
    }
    if (this.generationsSinceImprovement > this.config.dropoffAge) {
      this.stagnated = true;
    }
  }

  getTotalAdjustedFitness() {
    let total = 0;
    for (const genome of this.genomes) {
      total += genome.adjustedFitness;
    }
    return total;
  }

  getBestGenome() {
    let bestGenome = this.genomes[0];
    for (const genome of this.genomes) {
      if (genome.fitness > bestGenome.fitness) {
        bestGenome = genome;
      }
    }
    return bestGenome;
  }

  setRandomRepresentative() {
    if (this.genomes.length === 0) {
      this.representative = null;
    } else {
      this.representative = this.genomes[Math.floor(Math.random() * this.genomes.length)];
    }
  }
}

module.exports = Species;