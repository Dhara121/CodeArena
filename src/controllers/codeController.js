const axios = require('axios');
const Project = require('../models/Project');

// JDoodle API configuration
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
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

// Execute code
const executeCode = async (req, res) => {
  try {
    const { language, code, input = '', projectId } = req.body;
    const userId = req.user?._id;

    // Check if language is supported
    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        message: 'Unsupported language',
        supportedLanguages: Object.keys(LANGUAGE_MAP)
      });
    }

    // Validate JDoodle credentials
    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: 'Code execution service not configured'
      });
    }

    const languageConfig = LANGUAGE_MAP[language];

    // Prepare JDoodle request
    const jdoodleRequest = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      language: languageConfig.language,
      versionIndex: languageConfig.versionIndex,
      stdin: input
    };

    try {
      // Make request to JDoodle API
      const response = await axios.post(JDOODLE_API_URL, jdoodleRequest, {
        timeout: 30000 // 30 second timeout
      });

      const result = response.data;

      // Update project execution stats if projectId is provided
      if (projectId && userId) {
        try {
          const project = await Project.findById(projectId);
          if (project && project.owner.toString() === userId.toString()) {
            await project.incrementExecution();
          }
        } catch (error) {
          console.error('Error updating project execution stats:', error);
          // Don't fail the request if stats update fails
        }
      }

      // Format response
      const executionResult = {
        output: result.output || '',
        error: result.error || '',
        statusCode: result.statusCode || 200,
        memory: result.memory || '',
        cpuTime: result.cpuTime || '',
        language: language,
        executedAt: new Date().toISOString()
      };

      res.json({
        message: 'Code executed successfully',
        result: executionResult
      });

    } catch (jdoodleError) {
      console.error('JDoodle API error:', jdoodleError.message);
      
      // Handle different types of JDoodle errors
      if (jdoodleError.response) {
        const status = jdoodleError.response.status;
        const errorData = jdoodleError.response.data;
        
        if (status === 401) {
          return res.status(500).json({
            message: 'Code execution service authentication failed'
          });
        } else if (status === 429) {
          return res.status(429).json({
            message: 'Rate limit exceeded. Please try again later.'
          });
        } else {
          return res.status(500).json({
            message: 'Code execution failed',
            error: errorData.error || 'Unknown error'
          });
        }
      } else if (jdoodleError.code === 'ECONNABORTED') {
        return res.status(408).json({
          message: 'Code execution timeout. Please try again.'
        });
      } else {
        return res.status(500).json({
          message: 'Code execution service unavailable'
        });
      }
    }

  } catch (error) {
    console.error('Execute code error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get supported languages
const getSupportedLanguages = async (req, res) => {
  try {
    const languages = Object.keys(LANGUAGE_MAP).map(lang => ({
      key: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      jdoodleLanguage: LANGUAGE_MAP[lang].language,
      versionIndex: LANGUAGE_MAP[lang].versionIndex
    }));

    res.json({
      message: 'Supported languages retrieved successfully',
      languages
    });
  } catch (error) {
    console.error('Get supported languages error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get JDoodle credit information
const getCreditInfo = async (req, res) => {
  try {
    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: 'Code execution service not configured'
      });
    }

    const creditRequest = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET
    };

    try {
      const response = await axios.post('https://api.jdoodle.com/v1/credit-spent', creditRequest, {
        timeout: 10000
      });

      res.json({
        message: 'Credit information retrieved successfully',
        creditInfo: response.data
      });
    } catch (jdoodleError) {
      console.error('JDoodle credit API error:', jdoodleError.message);
      res.status(500).json({
        message: 'Unable to retrieve credit information'
      });
    }
  } catch (error) {
    console.error('Get credit info error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Execute code with custom input/output handling (completing the incomplete function)
const executeWithCustomIO = async (req, res) => {
  try {
    const { language, code, testCases = [] } = req.body;
    const userId = req.user?._id;

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        message: 'Unsupported language',
        supportedLanguages: Object.keys(LANGUAGE_MAP)
      });
    }

    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: 'Code execution service not configured'
      });
    }

    const languageConfig = LANGUAGE_MAP[language];
    const results = [];

    // Execute code for each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      const jdoodleRequest = {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: languageConfig.language,
        versionIndex: languageConfig.versionIndex,
        stdin: testCase.input || ''
      };

      try {
        const response = await axios.post(JDOODLE_API_URL, jdoodleRequest, {
          timeout: 30000
        });

        const result = response.data;
        const actualOutput = (result.output || '').trim();
        const expectedOutput = (testCase.expectedOutput || '').trim();
        
        results.push({
          testCase: i + 1,
          input: testCase.input || '',
          expectedOutput: expectedOutput,
          actualOutput: actualOutput,
          passed: actualOutput === expectedOutput,
          error: result.error || '',
          memory: result.memory || '',
          cpuTime: result.cpuTime || '',
          statusCode: result.statusCode || 200
        });

        // Add small delay between requests to avoid rate limiting
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (jdoodleError) {
        console.error(`JDoodle API error for test case ${i + 1}:`, jdoodleError.message);
        
        results.push({
          testCase: i + 1,
          input: testCase.input || '',
          expectedOutput: testCase.expectedOutput || '',
          actualOutput: '',
          passed: false,
          error: 'Execution failed',
          memory: '',
          cpuTime: '',
          statusCode: 500
        });
      }
    }

    // Calculate summary
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    res.json({
      message: 'Code executed with test cases',
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: Math.round(successRate * 100) / 100
      },
      results,
      language,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Execute with custom IO error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Validate code syntax (basic validation)
const validateCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        message: 'Unsupported language'
      });
    }

    // Basic syntax validation patterns
    const validationRules = {
      javascript: [
        { pattern: /^[\s\S]*$/, message: 'Valid JavaScript syntax' }
      ],
      python: [
        { pattern: /^[\s\S]*$/, message: 'Valid Python syntax' }
      ],
      java: [
        { pattern: /class\s+\w+/, message: 'Java class definition required' },
        { pattern: /public\s+static\s+void\s+main/, message: 'Main method required' }
      ],
      cpp: [
        { pattern: /#include|using\s+namespace/, message: 'Include statements recommended' },
        { pattern: /int\s+main\s*\(/, message: 'Main function required' }
      ]
    };

    const rules = validationRules[language] || [];
    const violations = [];

    rules.forEach(rule => {
      if (!rule.pattern.test(code)) {
        violations.push(rule.message);
      }
    });

    res.json({
      message: 'Code validation completed',
      isValid: violations.length === 0,
      violations,
      language
    });

  } catch (error) {
    console.error('Validate code error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  executeCode,
  getSupportedLanguages,
  getCreditInfo,
  executeWithCustomIO,
  validateCode
};