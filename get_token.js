const http = require('http');

const data = JSON.stringify({
  rollNumber: 'GEO-2026-001',
  password: 'studentpassword'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/student/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
