const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// -----------------------------
// 1️⃣ Hardcoded User & Balance
// -----------------------------
const USER = { username: 'admin', password: 'password123' };
let accountBalance = 1000; // Starting balance

// Secret key for JWT
const SECRET_KEY = 'myjwtsecretkey';

// -----------------------------
// 2️⃣ JWT Authentication Middleware
// -----------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(400).json({ error: 'Malformed Authorization header' });
  }

  // Verify token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // attach user info to request
    next();
  });
};

// -----------------------------
// 3️⃣ Login Route (Generates JWT)
// -----------------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded authentication
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// -----------------------------
// 4️⃣ Protected Banking Routes
// -----------------------------

// View balance
app.get('/balance', verifyToken, (req, res) => {
  res.json({ balance: accountBalance });
});

// Deposit money
app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be greater than zero' });
  }

  accountBalance += amount;
  res.json({ message: 'Deposit successful', newBalance: accountBalance });
});

// Withdraw money
app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Withdrawal amount must be greater than zero' });
  }

  if (amount > accountBalance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  accountBalance -= amount;
  res.json({ message: 'Withdrawal successful', newBalance: accountBalance });
});

// -----------------------------
// 5️⃣ Start Server
// -----------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🏦 Banking API running on http://localhost:${PORT}`);
});
