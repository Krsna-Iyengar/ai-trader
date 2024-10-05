import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' }
];

const timePeriods = [
  { label: 'Intraday 5 Mins', value: 'TIME_SERIES_INTRADAY', interval: '5min' },
  { label: 'Intraday 15 Mins', value: 'TIME_SERIES_INTRADAY', interval: '15min' },
  { label: 'Intraday 30 Mins', value: 'TIME_SERIES_INTRADAY', interval: '30min' },
  { label: 'Intraday 60 Mins', value: 'TIME_SERIES_INTRADAY', interval: '60min' },
  { label: 'Daily', value: 'TIME_SERIES_DAILY', interval: null },
  { label: 'Weekly', value: 'TIME_SERIES_WEEKLY', interval: null },
  { label: 'Monthly', value: 'TIME_SERIES_MONTHLY', interval: null },
];

function Dashboard({ darkMode }) {
  const [marketData, setMarketData] = useState([]);
  const [error, setError] = useState('');
  const [symbol, setSymbol] = useState('AAPL');  // Default stock symbol
  const [timePeriod, setTimePeriod] = useState(timePeriods[0]);  // Default time period object
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('Alpha Vantage');  // Track which source is used
  const [stockDetails, setStockDetails] = useState({ ticker: '', name: '', price: '' });


  const apiKey = 'WEU2KFJIJLHCDXZ0';  // Replace with your actual API key

  // Fetch market data from Alpha Vantage
  const fetchMarketData = async (stockSymbol, selectedTimePeriod) => {
    setLoading(true);  // Set loading state to true while fetching
    setSource('Alpha Vantage');  // Default to Alpha Vantage initially
    try {
      const params = {
        function: selectedTimePeriod.value,
        symbol: stockSymbol,
        apikey: apiKey
      };

      if (selectedTimePeriod.value === 'TIME_SERIES_INTRADAY') {
        params.interval = selectedTimePeriod.interval;  // Set interval for intraday only
      }

      const response = await axios.get(`https://www.alphavantage.co/query`, { params });

      if (response.data.Note) {
        console.log("Alpha Vantage limit reached, fetching from yfinance...");
        fetchYFinanceData(stockSymbol);
        return;
      }

      let data;
      if (selectedTimePeriod.value === 'TIME_SERIES_INTRADAY') {
        data = response.data[`Time Series (${selectedTimePeriod.interval})`]; // Match the interval key
      } else if (selectedTimePeriod.value === 'TIME_SERIES_DAILY') {
        data = response.data['Time Series (Daily)'];
      } else if (selectedTimePeriod.value === 'TIME_SERIES_WEEKLY') {
        data = response.data['Weekly Time Series'];
      } else if (selectedTimePeriod.value === 'TIME_SERIES_MONTHLY') {
        data = response.data['Monthly Time Series'];
      }

      if (!data) {
        setError('No data available for the selected stock symbol');
        setMarketData([]);
      } else {
        // Map the data to a format that Recharts expects
        const formattedData = Object.entries(data).map(([time, values]) => ({
          time,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close'])
        }));
        setMarketData(formattedData);
        setError('');
      }

      // Fetch current price (using the latest time's close price)
      const latestTime = Object.keys(data)[0]; // Get the most recent timestamp
      const latestPrice = parseFloat(data[latestTime]['4. close']);

      // Update stock details (Ticker, Name, Price)
      const stock = popularStocks.find(s => s.symbol === stockSymbol);
      setStockDetails({ ticker: stockSymbol, name: stock?.name || stockSymbol, price: latestPrice });

    } catch (error) {
      setError('Failed to fetch market data');
      setMarketData([]);
      console.error(error);
    } finally {
      setLoading(false);  // Set loading state to false after fetching
    }
  };

  // Fallback function to fetch from yfinance
  const fetchYFinanceData = async (stockSymbol) => {
    setLoading(true);
    setSource('Yahoo Finance');  // Switch to yfinance as data source
    try {
      const response = await fetch(`/api/fallback/stock/${stockSymbol}`);
      const data = await response.json();

      const formattedData = Object.entries(data).map(([time, values]) => ({
        time,
        open: values.Open,
        high: values.High,
        low: values.Low,
        close: values.Close
      }));

      setMarketData(formattedData);
      setError('');  // Clear any previous errors
    } catch (error) {
      setError('Failed to fetch fallback data from yfinance');
      console.error('Error fetching fallback data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the market data when the symbol or time period changes
  useEffect(() => {
    fetchMarketData(symbol, timePeriod);
  }, [symbol, timePeriod]);

  // Handle stock selection from the dropdown
  const handleDropdownChange = (e) => {
    setSymbol(e.target.value);  // Set the selected stock symbol from dropdown
  };

  // Handle time period selection
  const handleTimePeriodChange = (e) => {
    const selectedPeriod = timePeriods.find(period => period.label === e.target.value);
    setTimePeriod(selectedPeriod);
  };

  // Handle stock input change from the user
  const handleInputChange = (e) => {
    setSymbol(e.target.value.toUpperCase());  // Set symbol from input field
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Dashboard</h1>

      {/* Error handling */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stock selection dropdown */}
      <div>
        <label htmlFor="stock-select">Choose a stock:</label>
        <select id="stock-select" value={symbol} onChange={handleDropdownChange}>
          {popularStocks.map(stock => (
            <option key={stock.symbol} value={stock.symbol}>{stock.name}</option>
          ))}
        </select>
      </div>

      {/* Stock input field */}
      <div>
        <label htmlFor="stock-input">Or type a stock symbol:</label>
        <input
          type="text"
          id="stock-input"
          value={symbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol (e.g., AAPL)"
          required
        />
      </div>

      {/* Time period selector */}
      <div>
        <label htmlFor="time-period">Select interval:</label>
        <select id="time-period" value={timePeriod.label} onChange={handleTimePeriodChange}>
          {timePeriods.map(period => (
            <option key={period.label} value={period.label}>{period.label}</option>
          ))}
        </select>
      </div>

      {/* Display stock details */}
      <div className="stock-details">
        <h3>Stock Details ({source}):</h3>
        <p><strong>Ticker:</strong> {stockDetails.ticker}</p>
        <p><strong>Name:</strong> {stockDetails.name} ({timePeriod.label})</p>
        <p><strong>Current Price:</strong> ${stockDetails.price}</p>
        <p>Intervals are the time between points on the graph. For example, if you select monthly, the chart will display data points that are a month apart from now to the past (left to right)</p>
      </div>

      {/* Display chart or loading state */}
      {loading ? (
        <p>Loading market data...</p>
      ) : marketData.length > 0 ? (
        <LineChart
          width={600}
          height={300}
          data={marketData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="open" stroke="#8884d8" />
          <Line type="monotone" dataKey="high" stroke="#82ca9d" />
          <Line type="monotone" dataKey="low" stroke="#ff7300" />
          <Line type="monotone" dataKey="close" stroke="#ff0000" />
        </LineChart>
      ) : (
        <p>No data available</p>
    )}
  </div>
);
}

export default Dashboard;
