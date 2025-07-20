const axios = require('axios');
const Project = require('../models/Project');

// JDoodle API configuration
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const JDOODLE_CREDIT_URL = 'https://api.jdoodle.com/v1/credit-spent';
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// Language mapping for JDoodle
const LANGUAGE_MAP = {
  'javascript': { language: 'nodejs', versionIndex: '3' },
  'python': { language: 'python3', versionIndex: '3' },
  'java': { language: 'java', versionIndex: '3' },
  'cpp': { language: 'cpp', versionIndex: '0' },
  'c': { language: 'c', versionIndex: '4' },
  'php': { language: 'php', versionIndex: '3' },
  'ruby': { language: 'ruby', versionIndex: '3' },
  'go': { language: 'go', versionIndex: '3' },
  'rust': { language: 'rust', versionIndex: '0' }
};

// Execute single code snippet
const executeCode = async (req, res) => {
  try {
    const { language, code, input = '', projectId } = req.body;
    const userId = req.user?._id;

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({ message: 'Unsupported language', supportedLanguages: Object.keys(LANGUAGE_MAP) });
    }

    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({ message: 'Code execution service not configured' });
    }

    const { language: jdLang, versionIndex } = LANGUAGE_MAP[language];

    const jdoodleRequest = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      language: jdLang,
      versionIndex,
      stdin: input
    };

    const response = await axios.post(JDOODLE_API_URL, jdoodleRequest, { timeout: 30000 });
    const result = response.data;

    // Optional: update project stats
    if (projectId && userId) {
      try {
        const project = await Project.findById(projectId);
        if (project && project.owner.toString() === userId.toString()) {
          await project.incrementExecution();
        }
      } catch (err) {
        console.error('Project update error:', err.message);
      }
    }

    res.json({
      message: 'Code executed successfully',
      result: {
        output: result.output || '',
        error: result.error || '',
        statusCode: result.statusCode || 200,
        memory: result.memory || '',
        cpuTime: result.cpuTime || '',
        language,
        executedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('JDoodle error:', err.message);

    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) return res.status(401).json({ message: 'Invalid JDoodle credentials' });
      if (status === 429) return res.status(429).json({ message: 'Rate limit exceeded' });
      return res.status(500).json({ message: 'Execution error', error: data?.error || 'Unknown error' });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Execution timeout' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get supported languages
const getSupportedLanguages = async (req, res) => {
  try {
    const languages = Object.keys(LANGUAGE_MAP).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      jdoodleLanguage: LANGUAGE_MAP[key].language,
      versionIndex: LANGUAGE_MAP[key].versionIndex
    }));

    res.json({ message: 'Supported languages retrieved', languages });
  } catch (err) {
    console.error('Language list error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get JDoodle credit info
const getCreditInfo = async (req, res) => {
  try {
    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({ message: 'Code execution service not configured' });
    }

    const creditRequest = { clientId: JDOODLE_CLIENT_ID, clientSecret: JDOODLE_CLIENT_SECRET };
    const response = await axios.post(JDOODLE_CREDIT_URL, creditRequest, { timeout: 10000 });

    res.json({ message: 'Credit info retrieved', creditInfo: response.data });
  } catch (err) {
    console.error('Credit info error:', err.message);
    res.status(500).json({ message: 'Unable to retrieve credit information' });
  }
};

// Execute code against test cases
const executeWithCustomIO = async (req, res) => {
  try {
    const { language, code, testCases = [] } = req.body;
    const userId = req.user?._id;

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({ message: 'Unsupported language', supportedLanguages: Object.keys(LANGUAGE_MAP) });
    }

    const { language: jdLang, versionIndex } = LANGUAGE_MAP[language];
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const jdoodleRequest = {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: jdLang,
        versionIndex,
        stdin: testCase.input || ''
      };

      try {
        const response = await axios.post(JDOODLE_API_URL, jdoodleRequest, { timeout: 30000 });
        const result = response.data;
        const actualOutput = (result.output || '').trim();
        const expectedOutput = (testCase.expectedOutput || '').trim();

        results.push({
          testCase: i + 1,
          input: testCase.input || '',
          expectedOutput,
          actualOutput,
          passed: actualOutput === expectedOutput,
          error: result.error || '',
          memory: result.memory || '',
          cpuTime: result.cpuTime || '',
          statusCode: result.statusCode || 200
        });

        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // avoid rate-limiting
        }

      } catch (error) {
        console.error(`Test case ${i + 1} error:`, error.message);
        results.push({
          testCase: i + 1,
          input: testCase.input || '',
          expectedOutput: testCase.expectedOutput || '',
          actualOutput: '',
          passed: false,
          error: 'Execution failed',
          statusCode: 500
        });
      }
    }

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;

    res.json({
      message: 'Code executed with test cases',
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: Math.round((passedTests / totalTests) * 10000) / 100
      },
      results,
      language,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom IO execution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validate code (basic rules per language)
const validateCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const validationRules = {
      javascript: [],
      python: [],
      java: [
        { pattern: /class\s+\w+/, message: 'Missing Java class definition' },
        { pattern: /public\s+static\s+void\s+main/, message: 'Missing main method' }
      ],
      cpp: [
        { pattern: /#include/, message: 'Missing #include' },
        { pattern: /int\s+main\s*\(/, message: 'Missing main function' }
      ]
    };

    const violations = [];
    (validationRules[language] || []).forEach(rule => {
      if (!rule.pattern.test(code)) {
        violations.push(rule.message);
      }
    });

    res.json({
      message: 'Validation complete',
      isValid: violations.length === 0,
      violations,
      language
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  executeCode,
  getSupportedLanguages,
  getCreditInfo,
  executeWithCustomIO,
  validateCode
};
