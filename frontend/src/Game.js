import React, { useState } from 'react';
import axios from 'axios';
import './Game.css';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

const Game = () => {
  const [startingCash, setStartingCash] = useState(0); 
  const [cashRemaining, setCashRemaining] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [stockSymbol, setStockSymbol] = useState(''); 
  const [purchasePrice, setPurchasePrice] = useState(''); 
  const [quantity, setQuantity] = useState(1);  // New: to allow users to choose quantity
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');

  // Step 2: Handle starting cash selection
  const handleStartingCash = (cash) => {
    console.log(`Starting cash set to: ${cash}`);
    setStartingCash(cash);
    setCashRemaining(cash); 
  };

  // Step 3: Fetch stock data from Alpha Vantage
  const fetchStockData = async (symbol) => {
    if (!symbol) {
      console.error('No stock symbol provided');
      setError('Please enter a valid stock symbol.');
      return;
    }

    try {
      console.log(`Fetching data for symbol: ${symbol}`);
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      
      const quote = response.data['Global Quote'];
      if (quote && quote['05. price']) {
        const price = parseFloat(quote['05. price']);
        setStockData({
          regularMarketPrice: price,
          symbol: symbol.toUpperCase(),
        });
        setPurchasePrice(price);
        console.log(`Fetched price: ${price} for ${symbol}`);
      } else {
        console.error('No stock data found');
        setError('Stock not found or unable to fetch data.');
      }
    } catch (error) {
      console.error('Error fetching stock data', error);
      setError('Error fetching stock data');
    }
  };

  // Step 4: Handle buying a stock
  const handleBuyStock = () => {
    if (!purchasePrice || !stockSymbol) {
      setError('Invalid stock symbol or price.');
      return;
    }

    const totalCost = purchasePrice * quantity;
    console.log(`Attempting to buy ${quantity} shares of ${stockSymbol} at $${purchasePrice} per share, total cost: $${totalCost}`);

    if (totalCost <= cashRemaining) {
      const newStock = {
        symbol: stockSymbol.toUpperCase(),
        price: purchasePrice,
        quantity: quantity,
        totalCost: totalCost,
        time: new Date().toLocaleString(), 
      };
      setPortfolio([...portfolio, newStock]);
      setCashRemaining(cashRemaining - totalCost); 
      setStockSymbol(''); 
      setPurchasePrice('');
      setQuantity(1);
      setError('');
      console.log(`Bought ${quantity} shares of ${stockSymbol} for a total of $${totalCost}`);
    } else {
      console.error('Not enough cash to buy this stock');
      setError('Not enough cash to buy this stock.');
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">AI-Trader-Game</h1>

      {error && <p style={{color: 'red'}}>{error}</p>} {/* Display errors if any */}

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

        {/* New: Input for stock quantity */}
        <input 
          className="quantity-input" 
          type="number" 
          placeholder="Quantity" 
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />

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
                {stock.quantity} shares of {stock.symbol} - ${stock.totalCost} (Bought on {stock.time})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Game;
