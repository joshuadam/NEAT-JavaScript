const GenomeTracker = require('./trackers/GenomeTracker');
const NodeTracker = require('./trackers/NodeTracker');

class StaticManager {
  constructor() {
    if (!StaticManager.instance) {
      StaticManager.instance = this;
      this.innovationTrackerMap = new Map();
      this.genomeTrackerMap = new Map();
      this.nodeTrackerMap = new Map();
    }
    return StaticManager.instance;
  }

  getInnovationTracker(populationId) {
    if (this.innovationTrackerMap.has(populationId)) {
      return this.innovationTrackerMap.get(populationId);
    } else {
      const InnovationTracker = require('./trackers/InnovationTracker');
      const newInnovationTracker = new InnovationTracker();
      this.innovationTrackerMap.set(populationId, newInnovationTracker);
      return newInnovationTracker;
    }
  }

  getGenomeTracker(populationId) {
    if (this.genomeTrackerMap.has(populationId)) {
      return this.genomeTrackerMap.get(populationId);
    } else {
      const genomeTracker = new GenomeTracker();
      this.genomeTrackerMap.set(populationId, genomeTracker);
      return genomeTracker;
    }
  }

  getNodeTracker(populationId) {
    if (this.nodeTrackerMap.has(populationId)) {
      return this.nodeTrackerMap.get(populationId);
    } else {
      const nodeTracker = new NodeTracker();
      this.nodeTrackerMap.set(populationId, nodeTracker);
      return nodeTracker;
    }
  }
}

module.exports = new StaticManager();