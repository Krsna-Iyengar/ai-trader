const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const marketDataRoute = require('./routes/marketData');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');  // Import the PostgreSQL client

// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,       // Username from .env
  host: process.env.DB_HOST,       // Host from .env (usually localhost)
  database: process.env.DB_NAME,   // Database name from .env
  password: process.env.DB_PASSWORD, // Password from .env
  port: process.env.DB_PORT,       // Port (5432 is the default for PostgreSQL)
});

//multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
app.use(cors());

// Mock database (replace this with a real database like MongoDB, MySQL, etc.)
let users = [];

// Sample route to test the database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ currentTime: result.rows[0] });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).send('Database error');
  }
});


// Sign-Up Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try{
  // Check if the user already exists
  const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userCheck.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Store the new user (in a real app, you'd save this to a database)
  const newUser = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );
  res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
} catch (err) {
  console.error('Error during sign-up:', err);
  res.status(500).send('Server error');
}
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});


//multer

app.use(express.json());

// Use the market data route
app.use('/api', marketDataRoute);

app.get('/api/users', (req, res) => {
  res.json(users);  // Sends the users array as a JSON response
});

app.get('/', (req, res) => {
  res.send('AI Trader API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});