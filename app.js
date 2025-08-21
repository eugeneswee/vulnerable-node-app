const express = require('express');
const mysql = require('mysql');
const app = express();

// VULNERABILITY 1: Hardcoded credentials (Critical)
const dbPassword = "admin123";
const apiKey = "sk-1234567890abcdef";
const secretToken = "my-secret-token-12345";

// VULNERABILITY 2: Weak cryptographic implementation (Major)
const crypto = require('crypto');
function weakHash(input) {
    // Using deprecated MD5 algorithm
    return crypto.createHash('md5').update(input).digest('hex');
}

// VULNERABILITY 3: Insecure random number generation (Minor)
function generateSessionId() {
    return Math.random().toString(36).substring(2);
}

// Database connection with hardcoded credentials
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: dbPassword,
    database: 'testdb'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VULNERABILITY 4: SQL Injection (Critical)
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    // Direct string concatenation - SQL injection vulnerability
    const query = "SELECT * FROM users WHERE id = " + userId;
    
    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(results);
        }
    });
});

// VULNERABILITY 5: Cross-Site Scripting (XSS) (Major)
app.post('/comment', (req, res) => {
    const comment = req.body.comment;
    // Unescaped output - XSS vulnerability
    const html = `<div>User comment: ${comment}</div>`;
    res.send(html);
});

// VULNERABILITY 6: Path Traversal (Major)
app.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const fs = require('fs');
    
    try {
        // Direct path concatenation - path traversal vulnerability
        const content = fs.readFileSync('./files/' + filename, 'utf8');
        res.send(content);
    } catch (error) {
        res.status(404).send('File not found');
    }
});

// VULNERABILITY 7: Command Injection (Critical)
app.post('/ping', (req, res) => {
    const host = req.body.host;
    const { exec } = require('child_process');
    
    // Unsanitized input to shell command - command injection vulnerability
    exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ result: stdout });
        }
    });
});

// VULNERABILITY 8: Information Disclosure (Minor)
app.get('/debug', (req, res) => {
    res.json({
        environment: process.env,
        config: {
            dbPassword: dbPassword,
            apiKey: apiKey,
            secretToken: secretToken
        }
    });
});

// VULNERABILITY 9: Insecure HTTP headers (Minor)
app.get('/admin', (req, res) => {
    // Missing security headers
    res.send('<h1>Admin Panel</h1><p>Sensitive administrative interface</p>');
});

// VULNERABILITY 10: Regex DoS (Minor)
app.post('/validate', (req, res) => {
    const input = req.body.input;
    // Vulnerable regex pattern - ReDoS
    const vulnerableRegex = /^(a+)+$/;
    
    if (vulnerableRegex.test(input)) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Vulnerable Node.js Application',
        version: '1.0.0',
        endpoints: [
            'GET /user/:id - SQL injection vulnerability',
            'POST /comment - XSS vulnerability', 
            'GET /file/:filename - Path traversal vulnerability',
            'POST /ping - Command injection vulnerability',
            'GET /debug - Information disclosure',
            'GET /admin - Missing security headers',
            'POST /validate - ReDoS vulnerability'
        ]
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Vulnerable application running on port ${port}`);
    console.log('WARNING: This application contains intentional security vulnerabilities');
    console.log('Do not deploy to production!');
});

module.exports = app;
