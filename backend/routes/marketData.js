const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to fetch market data from Alpha Vantage
router.get('/market-data', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'AAPL';  // Default to AAPL if no symbol is provided
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });
    
    res.json(response.data);  // Return the market data as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error fetching market data' });
  }
});

module.exports = router;
