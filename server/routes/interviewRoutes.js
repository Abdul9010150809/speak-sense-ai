const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const InterviewSession = require("../models/InterviewSession");
const {
    loadQuestionDatasetFromAllSources,
    clearQuestionDatasetCache,
} = require("../utils/datasetQuestionLoader");

// ---- Grammar Analysis Helpers ---- //
const grammarPatterns = [
    { pattern: /\b(i)\b/g, fix: 'I', rule: 'Always capitalize "I"' },
    { pattern: /\b(gonna|wanna|gotta)\b/gi, fix: (m) => ({ gonna: 'going to', wanna: 'want to', gotta: 'got to' }[m.toLowerCase()]), rule: 'Avoid informal contractions in interviews' },
    { pattern: /\b(Me and )([A-Z])/g, fix: '$2 and I', rule: '"Me and ..." should be "[Name] and I"' },
    { pattern: /\b(there was )([a-z]+ (?:of|who) (?:was|were|had))/gi, fix: null, rule: 'Consider subject-verb agreement' },
    { pattern: /\b(alot)\b/gi, fix: 'a lot', rule: '"alot" is not a word — use "a lot"' },
    { pattern: /\b(your)\b/gi, fix: null, rule: 'Check "your" vs "you\'re" usage' },
    { pattern: /\b(uh|um|er|ah|like,)\b/gi, fix: null, rule: 'Reduce filler words (uh, um, like)' },
    { pattern: /\b(very very|really really)\b/gi, fix: null, rule: 'Avoid repetitive intensifiers' },
    { pattern: /\.{3,}/g, fix: '...', rule: 'Excessive ellipsis — use complete sentences' },
];

const improvementTopicMap = [
    { keywords: ['react', 'component', 'hooks', 'jsx', 'frontend'], topics: ['React Advanced Patterns', 'Component Design', 'Custom Hooks'] },
    { keywords: ['node', 'express', 'backend', 'rest', 'api', 'server'], topics: ['REST API Design', 'Node.js Best Practices', 'Database Integration'] },
    { keywords: ['database', 'sql', 'mongodb', 'schema', 'query'], topics: ['SQL Fundamentals', 'Database Normalization', 'Query Optimization'] },
    { keywords: ['algorithm', 'sort', 'search', 'complexity', 'big o'], topics: ['Time Complexity', 'Sorting Algorithms', 'Data Structures'] },
    { keywords: ['team', 'conflict', 'collaboration', 'manage', 'leadership'], topics: ['Team Communication', 'Conflict Resolution', 'Leadership Skills'] },
    { keywords: ['design', 'pattern', 'architecture', 'system', 'scalable'], topics: ['System Design', 'Design Patterns', 'Scalability Concepts'] },
];

const communicationTips = [
    'Use the STAR method (Situation, Task, Action, Result) for behavioral answers',
    'Quantify your achievements with numbers and percentages',
    'Vary your sentence length for natural speech rhythm',
    'Use transition words ("Furthermore", "As a result", "Building on that")',
    'Maintain a confident tone — avoid phrases like "I think maybe" or "I guess"',
    'Be concise: aim for 1–2 minute answers per question',
];

const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'to', 'from', 'of', 'on', 'in', 'at', 'by',
    'with', 'about', 'as', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'this', 'that', 'these',
    'those', 'i', 'you', 'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their', 'me', 'him', 'her', 'them',
    'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'just', 'so', 'very', 'really', 'also', 'there'
]);

const clampScore = (value, min = 0, max = 100) => Math.min(Math.max(Math.round(value), min), max);

function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token && token.length > 2 && !stopWords.has(token));
}

function evaluateAnswerRelevance(answerText, questionText) {
    if (!questionText || !questionText.trim()) {
        return {
            relevanceScore: 72,
            overlapRatio: 0,
            matchedKeywords: [],
            verdict: 'Question context unavailable, using generic answer quality scoring.'
        };
    }

    const answerTokens = tokenize(answerText);
    const questionTokens = tokenize(questionText);
    if (!answerTokens.length || !questionTokens.length) {
        return {
            relevanceScore: 45,
            overlapRatio: 0,
            matchedKeywords: [],
            verdict: 'Low relevance: answer did not include enough meaningful keywords.'
        };
    }

    const questionSet = new Set(questionTokens);
    const matchedKeywords = [...new Set(answerTokens.filter((token) => questionSet.has(token)))];
    const overlapRatio = matchedKeywords.length / Math.max(questionSet.size, 1);

    const lengthBonus = Math.min(18, Math.floor(answerTokens.length / 7));
    const relevanceScore = clampScore(35 + overlapRatio * 55 + lengthBonus);

    let verdict = 'Needs better alignment to the asked question.';
    if (relevanceScore >= 80) verdict = 'Strongly relevant answer to the asked question.';
    else if (relevanceScore >= 65) verdict = 'Mostly relevant answer with room for sharper focus.';

    return {
        relevanceScore,
        overlapRatio: Number(overlapRatio.toFixed(2)),
        matchedKeywords: matchedKeywords.slice(0, 8),
        verdict
    };
}

function buildVerificationResult({ message, question, grammarIssues, stats }) {
    const normalizedTranscript = (message || '').replace(/\s+/g, ' ').trim();
    const grammarScore = clampScore(100 - (grammarIssues.length * 10));
    const relevance = evaluateAnswerRelevance(normalizedTranscript, question || '');

    const structureBonus = stats?.sentenceCount >= 2 ? 6 : 0;
    const overallScore = clampScore(
        (grammarScore * 0.45)
        + (relevance.relevanceScore * 0.45)
        + structureBonus
    );

    let correctnessLabel = 'needs-improvement';
    if (overallScore >= 80) correctnessLabel = 'correct';
    else if (overallScore >= 65) correctnessLabel = 'partially-correct';

    return {
        transcript: normalizedTranscript,
        grammarScore,
        relevanceScore: relevance.relevanceScore,
        overallScore,
        isCorrect: overallScore >= 80,
        correctnessLabel,
        matchedKeywords: relevance.matchedKeywords,
        overlapRatio: relevance.overlapRatio,
        verdict: relevance.verdict
    };
}

function analyzeGrammar(text) {
    if (!text || text.trim().length < 5) return [];
    const issues = [];
    const seen = new Set();

    grammarPatterns.forEach(({ pattern, rule }) => {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        while ((match = regex.exec(text)) !== null) {
            const key = rule + match.index;
            if (!seen.has(key)) {
                seen.add(key);
                issues.push({
                    word: match[0],
                    rule,
                    position: match.index,
                    context: text.slice(Math.max(0, match.index - 15), match.index + match[0].length + 15)
                });
            }
            if (!regex.global) break;
        }
    });
    return issues.slice(0, 6);
}

function detectTopics(text) {
    const lower = text.toLowerCase();
    const suggestions = new Set();
    improvementTopicMap.forEach(({ keywords, topics }) => {
        if (keywords.some(k => lower.includes(k))) {
            topics.forEach(t => suggestions.add(t));
        }
    });
    // Generic communication
    if (suggestions.size === 0) {
        suggestions.add('Interview Communication Skills');
        suggestions.add('Professional Vocabulary');
    }
    return [...suggestions].slice(0, 4);
}

function detectImprovements(text) {
    const points = [];
    const wordCount = text.trim().split(/\s+/).length;
    const fillerCount = (text.match(/\b(uh|um|er|ah|like,|you know)\b/gi) || []).length;
    const fillerRatio = fillerCount / wordCount;

    if (wordCount < 30) points.push('Your answer was quite short — aim for at least 3–4 sentences.');
    if (wordCount > 250) points.push('Your answer was very long — practice being more concise.');
    if (fillerRatio > 0.05) points.push(`High filler word usage (${fillerCount} detected) — practice pausing instead.`);
    if (!/[?!.]/.test(text)) points.push('Use proper punctuation to structure ideas clearly.');
    if (!/\d/.test(text)) points.push('Consider adding specific numbers or metrics to strengthen credibility.');
    if (!/because|since|therefore|result|achieved|improved/i.test(text)) points.push('Include outcome statements: what did you achieve or improve?');
    const tip = communicationTips[Math.floor(Math.random() * communicationTips.length)];
    points.push(`💡 Tip: ${tip}`);
    return points.slice(0, 5);
}

const mockQuestions = {
    frontend: [
        "How does React's virtual DOM work?",
        "Explain the difference between props and state.",
        "What are React Hooks? Can you name a few?",
        "How do you handle state management in large React applications?"
    ],
    backend: [
        "What is the event loop in Node.js?",
        "How does Express handle middleware?",
        "Explain the difference between SQL and NoSQL databases.",
        "What are RESTful APIs and their principles?"
    ],
    general: [
        "Tell me about a challenging project you've worked on.",
        "How do you handle conflicts within a team?",
        "Where do you see yourself in 5 years?",
        "Why do you want to work here?"
    ]
};

const getCategoryQuestions = (role) => {
    const lowercaseRole = role?.toLowerCase() || '';
    if (lowercaseRole.includes('frontend') || lowercaseRole.includes('react')) return mockQuestions.frontend;
    if (lowercaseRole.includes('backend') || lowercaseRole.includes('node') || lowercaseRole.includes('developer')) return mockQuestions.backend;
    return mockQuestions.general;
};

const sessionQueues = new Map();

const normalizeDifficulty = (difficulty) => {
    const value = String(difficulty || '').toLowerCase();
    if (value === 'beginner') return 'beginner';
    if (value === 'advanced' || value === 'expert') return 'advanced';
    return 'intermediate';
};

const normalizeMode = (mode) => {
    const value = String(mode || '').toLowerCase();
    if (value === 'balanced' || value === 'mixed') return 'balanced';
    if (value === 'technical') return 'technical';
    if (value === 'behavioral') return 'behavioral';
    if (value === 'communication') return 'communication';
    if (value === 'systemdesign' || value === 'system design') return 'systemDesign';
    return 'balanced';
};

const resolveRoleTrack = (role) => {
    const value = String(role || '').toLowerCase();
    if (/(frontend|react|ui|ux)/.test(value)) return 'frontend';
    if (/(backend|api|node|server|devops|infra)/.test(value)) return 'backend';
    if (/(data|ml|ai|scientist|analytics)/.test(value)) return 'data';
    return 'general';
};

const dedupeQuestions = (list) => {
    const seen = new Set();
    return (list || []).filter((item) => {
        const normalized = String(item || '').trim();
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });
};

const isPostureQuestion = (question) => {
    const lower = String(question || '').toLowerCase();
    return /(posture|camera|framing|eye contact|body language|head position|shoulders|lighting)/.test(lower);
};

const collectPostureQuestions = (dataset, difficulty) => {
    const safeDifficulty = difficulty || 'intermediate';
    const tracks = ['general', 'frontend', 'backend', 'data'];
    const categories = ['communication', 'behavioral', 'technical'];

    const combined = tracks.flatMap((track) => (
        categories.flatMap((category) => (
            dataset?.questions?.[track]?.[category]?.[safeDifficulty]
            || dataset?.questions?.[track]?.[category]?.intermediate
            || []
        ))
    ));

    return dedupeQuestions(combined).filter((item) => isPostureQuestion(item));
};

const categoryMapByMode = {
    technical: ['technical'],
    behavioral: ['behavioral'],
    communication: ['communication'],
    systemDesign: ['systemDesign'],
    balanced: ['technical', 'behavioral', 'systemDesign', 'communication']
};

const buildQuestionQueueFromDataset = (role, config = {}) => {
    const dataset = loadQuestionDatasetFromAllSources();
    const roleTrack = resolveRoleTrack(role);
    const difficulty = normalizeDifficulty(config?.difficulty);
    const mode = normalizeMode(config?.mode);
    const maxQuestions = Math.min(Math.max(Number(config?.questionCount) || 5, 3), 10);

    const categories = categoryMapByMode[mode] || categoryMapByMode.balanced;
    const roleBuckets = categories.flatMap((category) => (
        dataset?.questions?.[roleTrack]?.[category]?.[difficulty]
        || dataset?.questions?.[roleTrack]?.[category]?.intermediate
        || []
    ));
    const generalBuckets = categories.flatMap((category) => (
        dataset?.questions?.general?.[category]?.[difficulty]
        || dataset?.questions?.general?.[category]?.intermediate
        || []
    ));
    const fallback = getCategoryQuestions(role);
    const postureQuestions = collectPostureQuestions(dataset, difficulty);

    const merged = dedupeQuestions([...roleBuckets, ...generalBuckets, ...fallback]);
    const queue = merged.slice(0, maxQuestions);

    const alreadyHasPosture = queue.some((item) => isPostureQuestion(item));
    if (!alreadyHasPosture && postureQuestions.length > 0 && queue.length > 0) {
        const postureCandidate = postureQuestions.find((item) => !queue.includes(item)) || postureQuestions[0];
        queue[queue.length - 1] = postureCandidate;
    }

    return dedupeQuestions(queue).slice(0, maxQuestions);
};

router.get('/dataset-status', (_req, res) => {
    const dataset = loadQuestionDatasetFromAllSources();
    return res.status(200).json({
        active: Boolean(dataset?.loaded),
        source: dataset?.source || 'unknown',
        generatedAt: dataset?.generatedAt || null,
        totalQuestions: Number(dataset?.stats?.totalQuestions || 0),
        sources: dataset?.stats?.sources || [],
        counts: dataset?.stats?.counts || {},
    });
});

router.post('/dataset-reload', (_req, res) => {
    clearQuestionDatasetCache();
    const dataset = loadQuestionDatasetFromAllSources({ forceReload: true });

    return res.status(200).json({
        active: Boolean(dataset?.loaded),
        source: dataset?.source || 'unknown',
        generatedAt: dataset?.generatedAt || null,
        totalQuestions: Number(dataset?.stats?.totalQuestions || 0),
        sources: dataset?.stats?.sources || [],
    });
});

const pruneSessionQueueCache = () => {
    if (sessionQueues.size <= 200) return;

    const sorted = [...sessionQueues.entries()]
        .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));

    sorted.slice(0, sorted.length - 200).forEach(([sessionId]) => {
        sessionQueues.delete(sessionId);
    });
};

function buildQuestionAwareReply(message, role, nextQuestion) {
    const text = (message || '').trim();
    const lower = text.toLowerCase();
    const askedQuestion = text.includes('?') || /\b(what|why|how|when|where|can you|could you|do you|is it)\b/.test(lower);

    const roleHint = role ? ` for this ${role} interview` : '';

    if (!askedQuestion) {
        return nextQuestion;
    }

    if (/\breact|component|hooks|frontend\b/.test(lower)) {
        return `Great question. In short, keep your React answers focused on state flow, component boundaries, and measurable UI impact.${roleHint}. ${nextQuestion}`;
    }

    if (/\bnode|express|backend|api|server\b/.test(lower)) {
        return `Good question. Emphasize request lifecycle, middleware design, and reliability tradeoffs when discussing backend work${roleHint}. ${nextQuestion}`;
    }

    if (/\bsql|database|mongo|query\b/.test(lower)) {
        return `Strong question. Discuss schema choices, indexing, and query optimization with one concrete example${roleHint}. ${nextQuestion}`;
    }

    if (/\bbehavior|team|conflict|lead\b/.test(lower)) {
        return `Good point. For behavioral questions, answer with STAR and include a measurable outcome${roleHint}. ${nextQuestion}`;
    }

    return `Great question. I’ll answer briefly and keep us progressing: focus on clarity, outcomes, and structured examples${roleHint}. ${nextQuestion}`;
}

const getUserIdFromRequest = (req) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token || !process.env.JWT_SECRET) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.id || null;
    } catch {
        return null;
    }
};

// Start interview session
router.post('/start', (req, res) => {
    const { avatar, role, config, industry } = req.body;

    if (!avatar || !role) {
        return res.status(400).json({ error: 'Avatar and role are required' });
    }

    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const queue = buildQuestionQueueFromDataset(role, config || {});
    sessionQueues.set(sessionId, {
        queue,
        createdAt: Date.now(),
    });
    pruneSessionQueueCache();

    const modeLabel = config?.mode ? ` Focus today: ${config.mode}.` : '';
    const difficultyLabel = config?.difficulty ? ` Difficulty: ${config.difficulty}.` : '';
    const industryLabel = industry ? ` Industry context: ${industry}.` : '';
    const initialGreeting = `Hello! I'm ${avatar.name}, your ${role}.${modeLabel}${difficultyLabel}${industryLabel} Let's begin your interview. To start, please introduce yourself.`;

    res.status(200).json({
        message: initialGreeting,
        sessionId
    });
});

// Chat endpoint for ongoing interview
router.post('/chat', (req, res) => {
    const { message, avatar, role, questionCount, config, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Simulate AI processing delay
    setTimeout(() => {
        const configuredMax = Number(config?.questionCount) || 5;
        const maxQuestions = Math.min(Math.max(configuredMax, 3), 10);
        const lowerMessage = (message || '').toLowerCase();

        if (questionCount >= maxQuestions) {
            return res.status(200).json({
                response: "Thank you for your time. That concludes our interview today. We will be in touch soon.",
                isComplete: true
            });
        }

        const queueFromSession = sessionId ? sessionQueues.get(String(sessionId))?.queue : null;
        const questions = Array.isArray(queueFromSession) && queueFromSession.length
            ? queueFromSession
            : buildQuestionQueueFromDataset(role, config || {});

        const safeIndex = Math.min(Math.max(Number(questionCount) || 0, 0), Math.max(questions.length - 1, 0));
        const nextQuestion = questions[safeIndex] || getCategoryQuestions(role)[0];

        if (/\b(next question|move on|continue|ask me next|let's continue)\b/.test(lowerMessage)) {
            let reasonPrefix = '';
            if (lowerMessage.includes('too hard')) reasonPrefix = "No problem — we can revisit that later. ";
            else if (lowerMessage.includes('clarification')) reasonPrefix = "Understood. I'll ask a clearer follow-up. ";
            else if (lowerMessage.includes('already answered') || lowerMessage.includes('repeated')) reasonPrefix = "Makes sense — let's avoid repetition. ";
            else if (lowerMessage.includes('time management')) reasonPrefix = "Good call on pacing. ";

            return res.status(200).json({
                response: `${reasonPrefix}Sure — let's continue. ${nextQuestion}`,
                isComplete: false
            });
        }

        // Add some random conversational filler sometimes
        const fillers = ["That's interesting.", "I see.", "Good point.", "Understood."];
        const filler = Math.random() > 0.5 ? fillers[Math.floor(Math.random() * fillers.length)] + " " : "";

        const contextualReply = buildQuestionAwareReply(message, role, nextQuestion);

        res.status(200).json({
            response: `${filler}${contextualReply}`,
            isComplete: false
        });
    }, 1000); // 1 second delay
});

// Analyze user's answer for grammar, improvements, and topic suggestions
router.post('/analyze', (req, res) => {
    const { message, question } = req.body;

    if (!message || message.trim().length < 3) {
        return res.status(400).json({ error: 'Message is required for analysis' });
    }

    const grammarIssues = analyzeGrammar(message);
    const improvements = detectImprovements(message);
    const topics = detectTopics(message);

    const wordCount = message.trim().split(/\s+/).length;
    const sentenceCount = (message.match(/[.!?]+/g) || []).length;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : wordCount;
    const statsScore = Math.max(40, 100 - (grammarIssues.length * 8) - Math.min(30, (improvements.length - 1) * 6));
    const verification = buildVerificationResult({
        message,
        question,
        grammarIssues,
        stats: { wordCount, sentenceCount, avgWordsPerSentence, score: statsScore }
    });

    res.status(200).json({
        grammarIssues,
        improvements,
        topics,
        verification,
        stats: {
            wordCount,
            sentenceCount,
            avgWordsPerSentence,
            score: statsScore
        }
    });
});

router.post('/session', async (req, res) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { summary, report, selections } = req.body || {};
        if (!summary || !report) {
            return res.status(400).json({ message: 'summary and report are required' });
        }

        const sessionDoc = await InterviewSession.create({
            userId,
            sessionId: String(summary.sessionId || Date.now()),
            interviewerName: summary.interviewer || '',
            interviewerRole: summary.role || '',
            interviewMode: summary.mode || 'Chat',
            durationSeconds: Number(summary.durationSeconds || 0),
            questionsAnswered: Number(summary.questionsAnswered || 0),
            industry: summary.industry || '',
            config: summary.config || {},
            selections: selections || {},
            report,
        });

        return res.status(201).json({
            message: 'Interview session saved',
            id: sessionDoc._id,
        });
    } catch (error) {
        console.error('Interview session save error:', error);
        return res.status(500).json({ message: 'Failed to save interview session' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const requestedLimit = Number(req.query.limit || 30);
        const limit = Math.min(Math.max(requestedLimit, 1), 100);

        const sessions = await InterviewSession.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const items = sessions.map((session) => {
            const score = Number(session.report?.overview?.score || 0);
            const typeName = session.selections?.type?.name
                || (typeof session.config?.mode === 'string'
                    ? session.config.mode.charAt(0).toUpperCase() + session.config.mode.slice(1)
                    : 'Mixed');
            const difficultyName = session.selections?.difficulty?.name
                || (typeof session.config?.difficulty === 'string'
                    ? session.config.difficulty.charAt(0).toUpperCase() + session.config.difficulty.slice(1)
                    : 'Intermediate');

            return {
                id: String(session._id),
                role: session.config?.targetRole || session.interviewerRole || 'Interview Session',
                company: 'SpeakSense AI',
                date: session.createdAt,
                score,
                status: 'Completed',
                type: typeName,
                difficulty: difficultyName,
                feedback: session.report?.feedback?.positive?.[0] || 'Interview completed successfully.',
                strengths: session.report?.feedback?.positive || [],
                improvements: session.report?.feedback?.improvements || [],
                duration: `${Math.max(1, Math.round(Number(session.durationSeconds || 0) / 60))} min`,
                interviewer: session.interviewerName || 'AI Interviewer',
            };
        });

        return res.status(200).json({ items });
    } catch (error) {
        console.error('Interview history fetch error:', error);
        return res.status(500).json({ message: 'Failed to load interview history' });
    }
});

module.exports = router;

