import React, { useState } from 'react';
import yahooFinance from 'yahoo-finance2';
import { Configuration, OpenAIApi } from "openai";

// Initialize OpenAI GPT API
const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Your GPT API key here
});
const openai = new OpenAIApi(configuration);

const Advisor = () => {
  const [userQuery, setUserQuery] = useState('');
  const [stockData, setStockData] = useState(null);
  const [gptResponse, setGptResponse] = useState('');

  // Step 1: Use GPT to interpret the user query
  const interpretQuery = async (query) => {
    try {
      const gptResult = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Extract key stock-related information from the following query: "${query}"`,
        max_tokens: 50,
      });

      const responseText = gptResult.data.choices[0].text.trim();
      setGptResponse(responseText);

      // Extract relevant stock symbol or info from GPT response
      const stockSymbol = extractStockSymbol(responseText);
      
      if (stockSymbol) {
        fetchStockData(stockSymbol);
      } else {
        alert("Sorry, I couldn't find the stock you were looking for.");
      }

    } catch (error) {
      console.error("Error interpreting query:", error);
    }
  };

  // Helper function to extract stock symbols
  const extractStockSymbol = (responseText) => {
    const match = responseText.match(/\b[A-Z]{2,4}\b/); 
    return match ? match[0] : null;
  };

  // Fetch stock data from Yahoo Finance
  const fetchStockData = async (symbol) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      setStockData(quote);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // Handle user query input and submission
  const handleSearch = () => {
    interpretQuery(userQuery);
  };

  return (
    <div className="advisor-container">
      <h1 className="advisor-title">AI Trading Advisor</h1>

      {/* User Input for Natural Language Query */}
      <input
        type="text"
        placeholder="Ask about a stock (e.g., 'What is the current price of Apple?')"
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        className="query-input"
      />
      <button onClick={handleSearch} className="search-button">Search</button>

      {/* Display GPT Response */}
      {gptResponse && (
        <div className="gpt-response">
          <h3>GPT Interpretation:</h3>
          <p>{gptResponse}</p>
        </div>
      )}

      {/* Display Stock Data */}
      {stockData && (
        <div className="stock-info">
          <h3>{stockData.symbol}</h3>
          <p>Current Price: ${stockData.regularMarketPrice}</p>
          <p>Sector: {stockData.quoteType}</p>
        </div>
      )}
    </div>
  );
};

export default Advisor;

/*
.advisor-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.advisor-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.query-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
}

.search-button {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

.gpt-response {
  margin-top: 20px;
}

.gpt-response h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.stock-info {
  margin-top: 20px;
  background-color: #e6f7ff;
  padding: 15px;
  border-radius: 5px;
}

.stock-info h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.stock-info p {
  margin: 0;
  font-size: 16px;
  color: #555;
}
*/