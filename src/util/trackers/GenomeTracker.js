class GenomeTracker {
  constructor() {
    this.genomeId = 0;
  }

  getNextGenomeId() {
    return this.genomeId++;
  }
}

module.exports = GenomeTracker;