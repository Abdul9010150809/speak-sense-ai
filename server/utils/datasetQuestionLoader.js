const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DATASETS_DIR = path.resolve(__dirname, "../../datasets");
const ARCHIVE_ZIP = path.join(DATASETS_DIR, "archive.zip");
const ARCHIVE_JSON_NAME = "prepared_dataset 1.json";
const TED_ZIP = path.join(DATASETS_DIR, "tedtalks.zip");
const TED_MAIN = "ted_main.csv";
const STACK_ZIP_CANDIDATES = [
  path.join(DATASETS_DIR, "sttack.zip"),
  path.join(DATASETS_DIR, "stack.zip"),
];
const STACK_QUESTIONS = "Questions.csv";
const HUMANPOSE_ZIP = path.join(DATASETS_DIR, "humanpose.zip");
const RYERSON_ZIP = path.join(DATASETS_DIR, "ryerson.zip");

let cache = null;

const TRACKS = ["general", "frontend", "backend", "data"];
const CATEGORIES = ["technical", "behavioral", "systemDesign", "communication"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const buildBaseShape = () => {
  const base = {};
  TRACKS.forEach((track) => {
    base[track] = {};
    CATEGORIES.forEach((category) => {
      base[track][category] = {};
      DIFFICULTIES.forEach((difficulty) => {
        base[track][category][difficulty] = [];
      });
    });
  });
  return base;
};

const cleanQuestionText = (value) => String(value || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/^[-*•\d.)\s]+/, "")
  .replace(/\s+/g, " ")
  .replace(/^"|"$/g, "")
  .trim();

const roleTrackForQuestion = (question) => {
  const lower = question.toLowerCase();
  if (/(react|ui|ux|frontend|css|browser|component)/.test(lower)) return "frontend";
  if (/(node|api|backend|server|database|sql|rest|microservice|auth|spring)/.test(lower)) return "backend";
  if (/(model|ml|data|analytics|statistics|feature|pipeline|experiment|dataset)/.test(lower)) return "data";
  return "general";
};

const categoryForQuestion = (question) => {
  const lower = question.toLowerCase();
  if (/(system design|design a|architecture|scalable|distributed|throughput|latency)/.test(lower)) return "systemDesign";
  if (/(team|conflict|leadership|stakeholder|mentor|collaborat)/.test(lower)) return "behavioral";
  if (/(explain|present|communicat|summarize|clarify|articulate)/.test(lower)) return "communication";
  return "technical";
};

const difficultyForQuestion = (question, seedDifficulty = "intermediate") => {
  const lower = question.toLowerCase();
  if (/(advanced|hard|scale|distributed|architecture|optimi[sz]e at scale)/.test(lower)) return "advanced";
  if (/(fundamental|basic|intro|beginner)/.test(lower)) return "beginner";
  return seedDifficulty;
};

const readZipFile = (zipPath, innerPath, options = {}) => {
  const { maxBuffer = 16 * 1024 * 1024, timeout = 20000 } = options;
  return execFileSync("unzip", ["-p", zipPath, innerPath], {
    encoding: "utf8",
    maxBuffer,
    timeout,
  });
};

const readZipHeadLines = (zipPath, innerPath, lineCount = 2000) => {
  const pythonSnippet = [
    "import io, sys, zipfile",
    "zip_path, inner_path, limit = sys.argv[1], sys.argv[2], int(sys.argv[3])",
    "with zipfile.ZipFile(zip_path) as z:",
    "    with z.open(inner_path) as f:",
    "        reader = io.TextIOWrapper(f, encoding='utf-8', errors='ignore')",
    "        for idx, line in enumerate(reader):",
    "            if idx >= limit:",
    "                break",
    "            sys.stdout.write(line)",
  ].join("\n");

  return execFileSync("python3", ["-c", pythonSnippet, zipPath, innerPath, String(lineCount)], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 15000,
  });
};

const listZipEntries = (zipPath) => {
  const pythonSnippet = [
    "import sys, zipfile",
    "zip_path = sys.argv[1]",
    "with zipfile.ZipFile(zip_path) as z:",
    "    for name in z.namelist():",
    "        print(name)",
  ].join("\n");

  const output = execFileSync("python3", ["-c", pythonSnippet, zipPath], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
    timeout: 12000,
  });

  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
};

const firstExistingPath = (candidates = []) => candidates.find((candidate) => fs.existsSync(candidate));

const addQuestion = (buckets, question, opts = {}) => {
  const normalized = cleanQuestionText(question);
  if (!normalized || normalized.length < 20 || normalized.length > 240) return false;

  const track = roleTrackForQuestion(normalized);
  const category = opts.category || categoryForQuestion(normalized);
  const difficulty = opts.difficulty || difficultyForQuestion(normalized, "intermediate");

  if (!buckets?.[track]?.[category]?.[difficulty]) return false;

  buckets[track][category][difficulty].push(normalized);
  buckets.general[category][difficulty].push(normalized);
  return true;
};

const parsePreparedJsonDataset = (buckets, stats) => {
  if (!fs.existsSync(ARCHIVE_ZIP)) {
    stats.sources.push({ source: "archive.zip", loaded: false, extracted: 0, reason: "missing" });
    return;
  }

  try {
    const content = readZipFile(ARCHIVE_ZIP, ARCHIVE_JSON_NAME, { maxBuffer: 30 * 1024 * 1024, timeout: 25000 });
    const rows = JSON.parse(content);
    if (!Array.isArray(rows)) {
      stats.sources.push({ source: "archive.zip", loaded: false, extracted: 0, reason: "invalid-json-array" });
      return;
    }

    let extracted = 0;
    rows.forEach((row) => {
      if (!Array.isArray(row?.response)) return;
      let seedDifficulty = "intermediate";

      row.response.forEach((line) => {
        const raw = String(line || "").trim();
        if (!raw) return;

        const lower = raw.toLowerCase();
        if (lower.includes("easy level") || lower.includes("fundamental")) {
          seedDifficulty = "beginner";
          return;
        }
        if (lower.includes("medium level") || lower.includes("deeper")) {
          seedDifficulty = "intermediate";
          return;
        }
        if (lower.includes("hard") || lower.includes("advanced")) {
          seedDifficulty = "advanced";
          return;
        }

        if (!/^[-*•]|^\d+\./.test(raw)) return;
        if (addQuestion(buckets, raw, { difficulty: seedDifficulty })) extracted += 1;
      });
    });

    stats.sources.push({ source: "archive.zip", loaded: true, extracted });
  } catch (error) {
    stats.sources.push({ source: "archive.zip", loaded: false, extracted: 0, reason: error.message });
  }
};

const parseTedTalkDataset = (buckets, stats) => {
  if (!fs.existsSync(TED_ZIP)) {
    stats.sources.push({ source: "tedtalks.zip", loaded: false, extracted: 0, reason: "missing" });
    return;
  }

  try {
    const head = readZipHeadLines(TED_ZIP, TED_MAIN, 600);
    const lines = head.split(/\r?\n/).slice(1);
    let extracted = 0;

    lines.forEach((line) => {
      if (!line || line.length < 20) return;
      const titleMatch = line.match(/"([^"]{20,140})"/);
      const candidate = titleMatch?.[1] || line.split(",")[0] || "";
      const title = cleanQuestionText(candidate);
      if (!title || title.length < 15) return;

      const question = `Explain the main idea of "${title}" and how you would present it clearly in an interview.`;
      if (addQuestion(buckets, question, { category: "communication", difficulty: "intermediate" })) {
        extracted += 1;
      }
    });

    stats.sources.push({ source: "tedtalks.zip", loaded: true, extracted });
  } catch (error) {
    stats.sources.push({ source: "tedtalks.zip", loaded: false, extracted: 0, reason: error.message });
  }
};

const parseStackDataset = (buckets, stats) => {
  const stackZipPath = firstExistingPath(STACK_ZIP_CANDIDATES);

  if (!stackZipPath) {
    stats.sources.push({ source: "sttack.zip|stack.zip", loaded: false, extracted: 0, reason: "missing" });
    return;
  }

  try {
    const head = readZipHeadLines(stackZipPath, STACK_QUESTIONS, 120);
    const lines = head.split(/\r?\n/).slice(1);
    let extracted = 0;

    lines.forEach((line) => {
      if (!line || line.length < 15) return;
      const quoted = line.match(/"([^"]{10,180})"/);
      let title = cleanQuestionText(quoted?.[1] || line.split(",")[1] || "");
      if (!title || title.length < 8) return;

      title = title.replace(/\?+$/, "");
      const question = `How would you solve this developer problem: ${title}?`;
      if (addQuestion(buckets, question, { category: "technical", difficulty: "intermediate" })) {
        extracted += 1;
      }
    });

    stats.sources.push({ source: path.basename(stackZipPath), loaded: true, extracted });
  } catch (error) {
    stats.sources.push({ source: path.basename(stackZipPath), loaded: false, extracted: 0, reason: error.message });
  }
};

const parseGenericDatasetZip = (buckets, stats, { zipPath, sourceName, category = "communication", difficulty = "intermediate", templateBuilder }) => {
  if (!fs.existsSync(zipPath)) {
    stats.sources.push({ source: sourceName, loaded: false, extracted: 0, reason: "missing" });
    return;
  }

  try {
    const entries = listZipEntries(zipPath)
      .filter((name) => /\.(csv|txt|json)$/i.test(name))
      .slice(0, 3);

    if (!entries.length) {
      stats.sources.push({ source: sourceName, loaded: false, extracted: 0, reason: "no-supported-files" });
      return;
    }

    let extracted = 0;

    entries.forEach((entryPath) => {
      const raw = readZipHeadLines(zipPath, entryPath, 220);
      const lines = raw.split(/\r?\n/).slice(1);

      lines.forEach((line, lineIndex) => {
        if (!line || line.length < 8) return;
        const cleaned = cleanQuestionText(line.replace(/[,;|]/g, " "));
        if (!cleaned || cleaned.length < 12) return;

        const question = templateBuilder(cleaned, { lineIndex, entryPath });
        if (addQuestion(buckets, question, { category, difficulty })) {
          extracted += 1;
        }
      });
    });

    stats.sources.push({ source: sourceName, loaded: extracted > 0, extracted });
  } catch (error) {
    stats.sources.push({ source: sourceName, loaded: false, extracted: 0, reason: error.message });
  }
};

const parseHumanPoseDataset = (buckets, stats) => {
  const postureCues = [
    "slouching",
    "leaning too close to the camera",
    "uneven shoulder posture",
    "poor eye-level camera alignment",
    "limited upper-body framing",
    "inconsistent eye contact",
    "distracting body movement",
    "low-light camera posture",
  ];

  const sanitizeHumanPoseSignal = (raw, fallbackIndex = 0) => {
    const cleaned = String(raw || "")
      .toLowerCase()
      .replace(/"/g, " ")
      .replace(/\b[a-z0-9_-]+\/(?:[a-z0-9_.-]+\/)*[a-z0-9_.-]+\b/g, " ")
      .replace(/\b\d+\b/g, " ")
      .replace(/\b(?:jpg|jpeg|png|bmp|gif|collage|poseestimation|pe|csv|json|txt)\b/g, " ")
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned || cleaned.length < 6) {
      return postureCues[fallbackIndex % postureCues.length];
    }

    return cleaned.split(" ").slice(0, 5).join(" ");
  };

  parseGenericDatasetZip(buckets, stats, {
    zipPath: HUMANPOSE_ZIP,
    sourceName: "humanpose.zip",
    category: "communication",
    difficulty: "intermediate",
    templateBuilder: (signal, meta = {}) => {
      const normalizedSignal = sanitizeHumanPoseSignal(signal, meta.lineIndex || 0);
      return `In a live interview, how would you maintain confident posture and correct issues like ${normalizedSignal} while continuing your answer clearly?`;
    },
  });
};

const parseRyersonDataset = (buckets, stats) => {
  if (!fs.existsSync(RYERSON_ZIP)) {
    stats.sources.push({ source: "ryerson.zip", loaded: false, extracted: 0, reason: "missing" });
    return;
  }

  try {
    const entries = listZipEntries(RYERSON_ZIP)
      .filter((name) => name && !name.endsWith("/"))
      .slice(0, 400);

    let extracted = 0;

    entries.forEach((entryName) => {
      const words = String(entryName)
        .replace(/\.[a-z0-9]+$/i, "")
        .split(/[\/._\-\s]+/)
        .map((part) => part.trim().toLowerCase())
        .filter((part) => /^[a-z]{3,}$/.test(part));

      if (!words.length) return;

      const signal = cleanQuestionText(words.slice(0, 3).join(" "));
      if (!signal) return;

      const question = `During an interview, how would you keep your tone controlled and professional when communicating around ${signal}?`;
      if (addQuestion(buckets, question, { category: "behavioral", difficulty: "intermediate" })) {
        extracted += 1;
      }
    });

    if (extracted === 0) {
      [
        "How do you regulate your emotions when answering an unexpected interview question?",
        "Describe a time you stayed calm while receiving critical feedback during a high-pressure discussion.",
        "What strategies do you use to keep your voice steady and confident in stressful conversations?",
      ].forEach((question) => {
        if (addQuestion(buckets, question, { category: "behavioral", difficulty: "intermediate" })) {
          extracted += 1;
        }
      });
    }

    stats.sources.push({ source: "ryerson.zip", loaded: extracted > 0, extracted });
  } catch (error) {
    stats.sources.push({ source: "ryerson.zip", loaded: false, extracted: 0, reason: error.message });
  }
};

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    const normalized = cleanQuestionText(item);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const normalizeBuckets = (buckets) => {
  TRACKS.forEach((track) => {
    CATEGORIES.forEach((category) => {
      DIFFICULTIES.forEach((difficulty) => {
        buckets[track][category][difficulty] = dedupe(buckets[track][category][difficulty]).slice(0, 120);
      });
    });
  });
  return buckets;
};

const summarizeStats = (questions, sources) => {
  const counts = {};
  TRACKS.forEach((track) => {
    counts[track] = {};
    CATEGORIES.forEach((category) => {
      counts[track][category] = {};
      DIFFICULTIES.forEach((difficulty) => {
        counts[track][category][difficulty] = questions[track][category][difficulty].length;
      });
    });
  });

  const totalQuestions = TRACKS.reduce((sumTrack, track) => (
    sumTrack + CATEGORIES.reduce((sumCategory, category) => (
      sumCategory + DIFFICULTIES.reduce((sumDifficulty, difficulty) => (
        sumDifficulty + questions[track][category][difficulty].length
      ), 0)
    ), 0)
  ), 0);

  return {
    totalQuestions,
    sources,
    counts,
  };
};

const loadQuestionDatasetFromAllSources = (options = {}) => {
  const forceReload = options && options.forceReload === true;
  if (cache && !forceReload) return cache;

  if (process.env.NODE_ENV === "test" && process.env.USE_DATASETS_IN_TEST !== "true") {
    const zeroCounts = {};
    TRACKS.forEach((track) => {
      zeroCounts[track] = {};
      CATEGORIES.forEach((category) => {
        zeroCounts[track][category] = {};
        DIFFICULTIES.forEach((difficulty) => {
          zeroCounts[track][category][difficulty] = 0;
        });
      });
    });

    cache = {
      loaded: false,
      source: "test-fast-path",
      generatedAt: new Date().toISOString(),
      questions: buildBaseShape(),
      stats: {
        totalQuestions: 0,
        sources: [{ source: "datasets", loaded: false, extracted: 0, reason: "skipped-in-test" }],
        counts: zeroCounts,
      },
    };
    return cache;
  }

  const questions = buildBaseShape();
  const sourceStats = { sources: [] };

  parsePreparedJsonDataset(questions, sourceStats);
  parseTedTalkDataset(questions, sourceStats);
  parseStackDataset(questions, sourceStats);
  parseHumanPoseDataset(questions, sourceStats);
  parseRyersonDataset(questions, sourceStats);

  const normalized = normalizeBuckets(questions);
  const stats = summarizeStats(normalized, sourceStats.sources);

  cache = {
    loaded: stats.totalQuestions > 0,
    source: "datasets-folder",
    generatedAt: new Date().toISOString(),
    questions: normalized,
    stats,
  };

  return cache;
};

const loadQuestionDatasetFromArchive = () => loadQuestionDatasetFromAllSources();

const clearQuestionDatasetCache = () => {
  cache = null;
};

module.exports = {
  loadQuestionDatasetFromArchive,
  loadQuestionDatasetFromAllSources,
  clearQuestionDatasetCache,
};
