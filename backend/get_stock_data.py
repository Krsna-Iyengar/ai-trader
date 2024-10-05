# get_stock_data.py

import yfinance as yf
import sys
import json

# Get the stock symbol from command line arguments
symbol = sys.argv[1]

# Fetch data using yfinance
stock = yf.Ticker(symbol)
data = stock.history(period="1y")  # You can adjust the period

# Convert the data to JSON and print it
print(data.to_json())
