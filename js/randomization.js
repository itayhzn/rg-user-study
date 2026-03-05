// Mulberry32 seeded PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit integer
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash >>> 0;
}

// Fisher-Yates shuffle using seeded RNG
function shuffle(array, rng) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate a session ID from the PRNG (avoids crypto.randomUUID() HTTP incompatibility)
function generateSessionId(rng) {
  const ts = Date.now().toString(36);
  const r1 = Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0');
  const r2 = Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0');
  return `${ts}-${r1}-${r2}`;
}

export function initializePairwiseSession(userName, pairs, questionsPerSession) {
  const seed = hashString(userName.toLowerCase().trim());
  const rng = mulberry32(seed);

  // Expand each set into all possible model pairs (C(n,2) per set)
  const allCandidates = [];
  for (const set of pairs) {
    const models = set.models;
    for (let i = 0; i < models.length; i++) {
      for (let j = i + 1; j < models.length; j++) {
        allCandidates.push({ dir: set.dir, modelA: models[i], modelB: models[j] });
      }
    }
  }

  const shuffled = shuffle(allCandidates, rng);
  const selected = shuffled.slice(0, Math.min(questionsPerSession, shuffled.length));

  const questionOrder = selected.map(({ dir, modelA, modelB }) => {
    const swap = rng() < 0.5;
    return {
      pairDir: dir,
      modelLeft: swap ? modelB : modelA,
      modelRight: swap ? modelA : modelB,
    };
  });

  const sessionId = generateSessionId(rng);

  return { seed, sessionId, questionOrder };
}
