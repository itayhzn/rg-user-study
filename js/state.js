const state = {
  config: null,          // config.json
  manifest: null,        // images/manifest.json
  userName: '',
  sessionId: '',
  startTime: null,       // ISO string, set on "Start!"
  randomizationSeed: 0,
  questionOrder: [],     // [{ pairIndex, modelLeft, modelRight }]
  responses: {},         // { pairIndex: { metricId: -1|0|1 } }
  promptStartTimes: {},  // { pairIndex: ISO string }
  currentQuestion: 0,
};

export default state;
