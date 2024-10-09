import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OpenAI } from 'openai'; // Import OpenAI correctly
import './Advisor.css'

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 

});

console.log('OpenAI API Key : ', process.env.REACT_APP_OPENAI_API_KEY);

const Advisor = ({ darkMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
/*
  // Center the container on the screen when it first loads
  useEffect(() => {
    const container = containerRef.current;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Calculate center position
    const top = (screenHeight - containerHeight) / 2;
    const left = (screenWidth - containerWidth) / 2;

    // Set the initial position
    setPosition({ top, left });
  }, []);

  const handleMouseDown = (e) => {
    const container = containerRef.current;
    setIsDragging(true);
    setOffset({
      x: e.clientX - container.offsetLeft,
      y: e.clientY - container.offsetTop,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      top: e.clientY - offset.y,
      left: e.clientX - offset.x,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };*/

  const [userQuery, setUserQuery] = useState('');
  const [stockData, setStockData] = useState(null);
  const [gptResponse, setGptResponse] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Track if a request is in progress
  const [realTimePrice, setRealTimePrice] = useState(null); // For real-time price from Alpha Vantage
  const [generalResponse, setGeneralResponse] = useState(''); // For general financial answers

  // Debounce function to limit rapid firing of requests
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Use GPT to interpret the user query
  const interpretQuery = async (query) => {
    try {
      console.log("User query:", query);
  
      const gptResult = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that provides stock information." },
          { role: "user", content: `Please provide the stock symbol for the following company query: "${query}".` }
        ],
        max_tokens: 50,
      });
  
      console.log("GPT response:", gptResult);
  
      const responseText = gptResult.choices[0].message.content.trim();
      setGptResponse(responseText);
  
      const stockSymbol = extractStockSymbol(responseText);
      console.log(`Extracted stock symbol: ${stockSymbol}`); // Log extracted stock symbol
  
      if (stockSymbol) {
        await fetchStockData(stockSymbol); // Call fetchStockData only if a stock symbol is extracted
      } else {
        alert("Sorry, I couldn't find the stock you were looking for.");
      }
    } catch (error) {
      console.error("Error interpreting query:", error);
    } finally {
      setIsSearching(false); // Re-enable the search button after request
    }
  };
  

  // Helper function to determine if the query is stock-related
  const isStockRelated = (query) => {
    const stockKeywords = ["price", "stock", "symbol", "market"];
    return stockKeywords.some((keyword) => query.toLowerCase().includes(keyword));
  };

  // Helper function to extract stock symbols from GPT's response
  const extractStockSymbol = (responseText) => {
    console.log("GPT Response Text for Symbol Extraction:", responseText); // Debugging log
  
    // More robust regex to extract stock symbols
    const match = responseText.match(/\b[A-Z]{1,5}\b/); // Match stock symbols (usually 1-5 uppercase letters)
    return match ? match[0] : null;
  };
  

  // Fetch real-time stock data from Alpha Vantage
  const fetchStockData = async (symbol) => {
    console.log(`Fetching real-time data for stock symbol: ${symbol}`); // Log when fetchStockData is called
  
    const url = `http://localhost:5000/api/stock/${symbol}`; // Your backend proxy route
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      console.log("Fetched Stock Data:", data); // Log the data for debugging
  
      if (data && data.symbol) {
        setRealTimePrice(data.price); // Set the real-time price
        setStockData({
          regularMarketPrice: data.price,
          symbol: data.symbol,
          volume: data.volume,
          open: data.open,
          high: data.high,
          low: data.low,
          previousClose: data.previousClose,
          change: data.change,
          changePercent: data.changePercent,
        });
      } else {
        alert("Stock not found or invalid response from the API.");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error.message);
      alert("Failed to fetch real-time stock data.");
    }
  };
  

  // Handle user query input and submission
  const handleSearch = useCallback(
    debounce(() => {
      if (!isSearching && userQuery) {
        setIsSearching(true); // Disable search button
        interpretQuery(userQuery);
      }
    }, 1000), // Debounce delay set to 1 second
    [userQuery, isSearching]
  );

  return (
    <div
      /*className={`advisor-container ${darkMode ? 'dark-mode' : ''}`}
      ref={containerRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}*/
    >
      <h1 className="advisor-title">AI Trading Advisor</h1>

      {/* User Input for Natural Language Query */}
      <input
        type="text"
        placeholder="Ask about a stock or general finance (e.g., 'What is arbitrage?')"
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        className="query-input"
      />
      <button onClick={handleSearch} className="search-button" disabled={isSearching || !userQuery}>
        {isSearching ? 'Searching...' : 'Search'}
      </button>

      {/* Display GPT Interpretation */}
      {gptResponse && (
        <div className="gpt-response">
          <h3>GPT Interpretation:</h3>
          <p>{gptResponse}</p>
        </div>
      )}

      {/* Display Real-Time Stock Data */}
      {stockData && (
        <div className="stock-info">
          <h3>{stockData.symbol}</h3>
          <p>Real-Time Price: ${realTimePrice}</p>
          <p>Volume: {stockData.volume}</p>
          <p>Open: ${stockData.open}</p>
          <p>High: ${stockData.high}</p>
          <p>Low: ${stockData.low}</p>
          <p>Previous Close: ${stockData.previousClose}</p>
          <p>Change: {stockData.change} ({stockData.changePercent})</p>
        </div>
      )}

      {/* Display General Financial Answer */}
      {generalResponse && (
        <div className="general-response">
          <h3>Finance Answer:</h3>
          <p>{generalResponse}</p>
        </div>
      )}
    </div>
  );
};

export default Advisor;
