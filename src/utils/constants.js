// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Programming Languages
const SUPPORTED_LANGUAGES = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  C: 'c',
  PHP: 'php',
  GO: 'go',
  RUST: 'rust'
};

// Default code templates
const CODE_TEMPLATES = {
  javascript: `// JavaScript Code
console.log("Hello, World!");

// Your code here...
`,
  python: `# Python Code
print("Hello, World!")

# Your code here...
`,
  java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Your code here...
    }
}
`,
  cpp: `// C++ Code
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Your code here...
    return 0;
}
`,
  c: `// C Code
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Your code here...
    return 0;
}
`,
  php: `<?php
// PHP Code
echo "Hello, World!\\n";

// Your code here...
?>
`,
  go: `// Go Code
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    // Your code here...
}
`,
  rust: `// Rust Code
fn main() {
    println!("Hello, World!");
    
    // Your code here...
}
`
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username/email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  PROJECT_NOT_FOUND: 'Project not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  CODE_EXECUTION_ERROR: 'Code execution failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  PROJECT_CREATED: 'Project created successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',
  CODE_EXECUTED: 'Code executed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SECRET: process.env.JWT_SECRET
};

// File size limits
const LIMITS = {
  CODE_MAX_LENGTH: 50000,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  BIO_MAX_LENGTH: 500,
  USERNAME_MAX_LENGTH: 20,
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  MAX_EXECUTIONS_HISTORY: 10
};

module.exports = {
  HTTP_STATUS,
  SUPPORTED_LANGUAGES,
  CODE_TEMPLATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  JWT_CONFIG,
  LIMITS
}; 
