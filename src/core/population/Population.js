const GenomeBuilder = require("../../util/GenomeBuilder");
const StaticManager = require("../../util/StaticManager");
const PopulationTracker = require("../../util/trackers/PopulationTracker");
const Species = require("./Species");

class Population {
  constructor(config) {
    this.genomes = [];

    this.species = [];
    this.eliteGenomes = [];
    this.newGeneration = [];
    this.config = config;
    this.allStagnated = false;
    this.stale = false;
    this.populationId = PopulationTracker.getNextPopulationId();
    this.innovationTracker = StaticManager.getInnovationTracker(this.populationId);
    this.generation = 0;
    this.speciesCounter = 0;
    this.bestFitness = 0;
    this.ageSinceLastImprovement = 0;
    this.speciated = false;

    let baseGenome = GenomeBuilder.buildGenome(config, this.populationId);

    for (let i = 0; i < config.populationSize; i++) {
      this.genomes.push(baseGenome.copy());
    }
    for (const genome of this.genomes) {
      genome.reinitializeWeights();
    }
  }

  speciate() {
    for (let species of this.species) {
      species.genomes = [];
    }
    for (const genome of this.genomes) {
      let speciesFound = false
      for (const species of this.species) {
        let representative = species.representative;
        if (representative === null) {
          continue;
        }
        if (genome.getGeneticEncoding().calculateCompatibilityDistance(representative.getGeneticEncoding()) < this.config.compatibilityThreshold) {
          species.addGenome(genome)
          speciesFound = true;
          break;
        }
      }
      if (!speciesFound) {
        let newSpecies = new Species(this.speciesCounter++, this.config);
        newSpecies.addGenome(genome);
        this.species.push(newSpecies);
      }
      this.species = this.species.filter(s => s.genomes.length > 0);
      this.species.forEach(s => s.setRandomRepresentative());
    }
    this.speciated = true;
  }

  evolve() {
    this.stale = false;
    this.allStagnated = false;
    this.newGeneration = [];
    this.eliteGenomes = [];

    if (!this.speciated) {
      this.speciate();
    }

    this.innovationTracker.reset();
    this.saveEliteGenomes();
    this.handleStagnation();
    this.removeWorstGenomes();
    this.calculateOffspring();
    this.generateOffspring();
    this.putBackElite();

    this.genomes = [];
    this.genomes.push(...this.newGeneration);

    this.generation++;
    this.speciated = false;
  }

  evaluatePopulation() {
    for (const genome of this.genomes) {
      genome.evaluateFitness();
    }
  }

  saveEliteGenomes() {
    this.genomes.sort((a, b) => b.fitness - a.fitness);

    this.eliteGenomes = [];

    for (const species of this.species) {
      if (species.genomes.length > 5) {
        this.eliteGenomes.push(species.getBestGenome().copy());
      }
    }

    let index = 0;
    while (this.eliteGenomes.length < this.config.numOfElite && index < this.genomes.length) {
      const candidate = this.genomes[index];
      let isDuplicate = this.eliteGenomes.some(elite => elite.equalsGenome(candidate));
      for (let selectedElite of this.eliteGenomes) {
        if (selectedElite === candidate) {
          isDuplicate = true;
        }
        if (selectedElite.equalsGenome(candidate)) {
          isDuplicate = true;
        }
      }
      if (!isDuplicate) {
        this.eliteGenomes.push(candidate.copy());
      }
      index++;
    }
  }


  handleStagnation() {
    this.updateFitnessAndStagnation();
    for (const species of this.species) {
      species.updateFitnessAndStagnation();
    }
    let allStagnated = true;
    for (const species of this.species) {
      if (!species.stagnated) {
        allStagnated = false;
        break;
      }
    }
    this.allStagnated = allStagnated;
    this.removeStale();
  }

  updateFitnessAndStagnation() {
    let currentBest = this.getBestGenome().fitness;
    if (currentBest > this.bestFitness) {
      this.bestFitness = currentBest;
      this.ageSinceLastImprovement = 0;
    } else {
      this.ageSinceLastImprovement++;
    }
    if (this.ageSinceLastImprovement > this.config.populationStagnationLimit) {
      this.stale = true;
    }
  }

  removeStale() {
    this.species.sort((a, b) => b.getBestGenome().fitness - a.getBestGenome().fitness);

    if (this.stale) {
      if (this.species.length > 3) {
        this.species.splice(2);
      }
      return;
    }

    if (this.allStagnated) {
      if (this.species.length > 2) {
        this.species.splice(1);
      }
      return;
    }

    for (let i = this.species.length - 1; i >= 0; i--) {
      if (this.species[i].stagnated) {
        this.species.splice(i, 1);
      }
    }
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

  removeWorstGenomes() {
    for (const species of this.species) {
      species.removeBadGenomes();
    }
  }

  calculateOffspring() {
    const remainingPopulation = this.config.populationSize - this.eliteGenomes.length;
    let totalAdjustedFitness = 0;

    this.species.forEach(s => {
      s.setAdjustedFitness();
      totalAdjustedFitness += s.getTotalAdjustedFitness();
    });

    const percentageOfOffspring = this.species.map(s =>
      (s.getTotalAdjustedFitness() / totalAdjustedFitness) * 100
    );

    this.species.forEach((s, i) => {
      const count = Math.floor((percentageOfOffspring[i] / 100) * remainingPopulation);
      s.offspringCount = count;
    });

    let totalOffspring = this.species.reduce((sum, s) => sum + s.offspringCount, 0);

    if (totalOffspring > remainingPopulation) {
      const difference = totalOffspring - remainingPopulation;
      let worstSpecies = this.species[0];
      this.species.forEach(s => {
        if (s.getTotalAdjustedFitness() < worstSpecies.getTotalAdjustedFitness()) {
          worstSpecies = s;
        }
      });
      worstSpecies.offspringCount -= difference;
    }

    if (totalOffspring < remainingPopulation) {
      const difference = remainingPopulation - totalOffspring;
      for (let i = 0; i < difference; i++) {
        const bestSpecies = this.selectBestSpecies();
        bestSpecies.offspringCount++;
      }
    }
  }

  selectBestSpecies() {
    let bestSpecies = this.species[0];
    for (const species of this.species) {
      if (species.bestFitness > bestSpecies.bestFitness) {
        bestSpecies = species;
      }
    }
    return bestSpecies;
  }

  generateOffspring() {
    this.species.forEach(s => {
      const offspringCount = s.offspringCount;
      const mutatedOnlyGenomes = [];

      for (let i = 0; i < offspringCount; i++) {
        const genomesInSpecies = s.genomes.length;

        if (Math.random() < this.config.mutateOnlyProb) {
          let selectedGenome = s.genomes[Math.floor(Math.random() * genomesInSpecies)];
          while (
            genomesInSpecies > 1 &&
            mutatedOnlyGenomes.includes(selectedGenome) &&
            i < genomesInSpecies
          ) {
            selectedGenome = s.genomes[Math.floor(Math.random() * genomesInSpecies)];
          }
          mutatedOnlyGenomes.push(selectedGenome);
          const offspring = selectedGenome.copy();
          offspring.mutate();
          this.newGeneration.push(offspring);
          continue;
        }

        if (Math.random() < this.config.interspeciesMatingRate && this.species.length > 1) {
          let randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
          while (randomSpecies === s) {
            randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
          }
          const parent1 = s.genomes[Math.floor(Math.random() * s.genomes.length)];
          const parent2 = randomSpecies.genomes[Math.floor(Math.random() * randomSpecies.genomes.length)];
          let offspring = parent1.crossover(parent2);
          if (Math.random() <= this.config.mutationRate) {
            offspring.mutate();
          }
          this.newGeneration.push(offspring);
          continue;
        }

        let offspring;
        if (s.genomes.length > 1) {
          let parentsFound = false;
          let parent1, parent2;
          while (!parentsFound) {
            parent1 = s.genomes[Math.floor(Math.random() * s.genomes.length)];
            parent2 = s.genomes[Math.floor(Math.random() * s.genomes.length)];
            if (parent1 !== parent2) {
              parentsFound = true;
            }
          }
          offspring = parent1.crossover(parent2);
          if (Math.random() <= this.config.mutationRate) {
            offspring.mutate();
          }
        } else {
          offspring = s.genomes[0].copy();
          offspring.mutate();
        }
        this.newGeneration.push(offspring);
      }
    });
  }

  putBackElite() {
    for (const eliteGenome of this.eliteGenomes) {
      this.newGeneration.push(eliteGenome);
    }
  }
}

module.exports = Population;