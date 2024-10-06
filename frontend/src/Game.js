import React, { useState } from 'react';
import yahooFinance from 'yahoo-finance2';
//npm instal yahoo-finance2

const Game = () => {
  const [startingCash, setStartingCash] = useState(0); 
  const [cashRemaining, setCashRemaining] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [stockSymbol, setStockSymbol] = useState(''); 
  const [purchasePrice, setPurchasePrice] = useState(''); 
  const [stockData, setStockData] = useState(null); // To store fetched stock data

  // Step 2: Handle starting cash selection
  const handleStartingCash = (cash) => {
    setStartingCash(cash);
    setCashRemaining(cash); 
  };

  // Step 3: Fetch stock data from Yahoo Finance
  const fetchStockData = async (symbol) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      setStockData(quote);
      setPurchasePrice(quote.regularMarketPrice); // Automatically fill the current price
    } catch (error) {
      console.error("Error fetching stock data", error);
      alert("Stock not found or unable to fetch data.");
    }
  };

  // Step 4: Handle buying a stock
  const handleBuyStock = () => {
    if (purchasePrice <= cashRemaining && stockSymbol) {
      const newStock = {
        symbol: stockSymbol.toUpperCase(),
        price: purchasePrice,
        time: new Date().toLocaleString(), 
      };
      setPortfolio([...portfolio, newStock]);
      setCashRemaining(cashRemaining - purchasePrice); 
      setStockSymbol(''); 
      setPurchasePrice(''); 
    } else {
      alert('Not enough cash to buy this stock or invalid stock symbol!');
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">AI-Trader-Game</h1>

      <div className="starting-cash-selection">
        <h2>Select Starting Cash</h2>
        <div className="cash-options">
          <button className="cash-button" onClick={() => handleStartingCash(1000)}>$1000</button>
          <button className="cash-button" onClick={() => handleStartingCash(10000)}>$10000</button>
          <button className="cash-button" onClick={() => handleStartingCash(100000)}>$100000</button>
        </div>
      </div>

      <div className="cash-info">
        <h3>Starting Cash: <span className="cash-amount">${startingCash}</span></h3>
        <h3>Cash Remaining: <span className="cash-amount">${cashRemaining}</span></h3>
      </div>

      <div className="stock-purchase-section">
        <h2>Buy a Stock</h2>
        <input 
          className="stock-input" 
          type="text" 
          placeholder="Stock Symbol (e.g. AAPL)" 
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value)}
        />
        <button className="fetch-button" onClick={() => fetchStockData(stockSymbol)}>Fetch Stock Data</button>
        
        {stockData && (
          <div className="stock-info">
            <p>Current Price for {stockSymbol.toUpperCase()}: ${stockData.regularMarketPrice}</p>
          </div>
        )}

        <button className="buy-button" onClick={handleBuyStock}>Buy Stock</button>
      </div>

      <div className="portfolio-section">
        <h2>Portfolio</h2>
        {portfolio.length === 0 ? (
          <p>No stocks purchased yet.</p>
        ) : (
          <ul className="portfolio-list">
            {portfolio.map((stock, index) => (
              <li key={index} className="portfolio-item">
                {stock.symbol} - ${stock.price} (Bought on {stock.time})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Game;

/*
.game-container {
  width: 80%;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.game-title {
  text-align: center;
  margin-top: 20px;
}

.starting-cash-selection h2 {
  margin-top: 20px;
}

.cash-options {
  display: flex;
  justify-content: space-around;
  margin: 10px 0;
}

.cash-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
}

.cash-button:hover {
  background-color:
*/
