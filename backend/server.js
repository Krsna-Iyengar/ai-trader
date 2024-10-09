const express = require('express');
const app = express();
const axios = require('axios');
const { spawn } = require('child_process');
const jwt = require('jsonwebtoken');
const path = require('path');
const port = process.env.PORT || 5000;
const marketDataRoute = require('./routes/marketData');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');  // Import the PostgreSQL client

console.log(typeof process.env.DB_PASSWORD); // Should be 'string'

const express = require('express');


// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Anything that doesn't match an API route should serve the frontend app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json());

// Allow requests from frontend origin (http://localhost:3000)
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-trader-in.herokuapp.com'],
  credentials: true,
}));

// Route to fetch stock data from Alpha Vantage
app.get('/api/stock/:symbol', async (req, res) => {
  const symbol = req.params.symbol;

  try {
    // Make request to Alpha Vantage
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: "CMZTXK62SKTEINS0",
      },
    });

    // Extract stock data from the response
    const stockData = response.data['Global Quote'];

    if (stockData && stockData['01. symbol']) {
      res.json({
        symbol: stockData['01. symbol'],
        price: stockData['05. price'],
        volume: stockData['06. volume'],
        open: stockData['02. open'],
        high: stockData['03. high'],
        low: stockData['04. low'],
        previousClose: stockData['08. previous close'],
        change: stockData['09. change'],
        changePercent: stockData['10. change percent'],
      });
    } else {
      res.status(404).json({ error: 'Stock data not found' });
    }
  } catch (error) {
    console.error('Error fetching stock data from Alpha Vantage:', error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload1 = multer({ storage });

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Use 'id' instead of 'userId'
    next();
    
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


// Use `upload1` in routes
app.post('/api/users/me/profile-pic', verifyToken, upload1.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received');
      return res.status(400).json({ message: 'No file received' });
    }
    
    const userId = req.userId;
    const profilePicPath = `/uploads/${req.file.filename}`;
    console.log('Updating profile picture path in DB:', profilePicPath);

    const result = await pool.query(
      'UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *',
      [profilePicPath, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,       // Username from .env
  host: process.env.DB_HOST,       // Host from .env (usually localhost)
  database: process.env.DB_NAME,   // Database name from .env
  password: process.env.DB_PASSWORD, // Password from .env
  port: process.env.DB_PORT,       // Port (5432 is the default for PostgreSQL)
});


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

app.post('/upload', upload1.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});

app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);
    console.log('Attempting to find user with id:', userId);

    const user = await pool.query('SELECT id, name, email, profile_pic, bio FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      console.log('User not found with id:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/me', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Extracted from verifyToken middleware
    const { name, email, profilePic, bio, password } = req.body;

    let query = `
      UPDATE users SET 
        name = $1, 
        email = $2, 
        profile_pic = $3, 
        bio = $4
    `;
    const queryValues = [name, email, profilePic, bio];

    // If password is provided, update it as well
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $5 WHERE id = $6 RETURNING *`;
      queryValues.push(hashedPassword, userId);
    } else {
      query += ` WHERE id = $5 RETURNING *`;
      queryValues.push(userId);
    }

    const result = await pool.query(query, queryValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/', (req, res) => {
  res.send('AI Trader API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});