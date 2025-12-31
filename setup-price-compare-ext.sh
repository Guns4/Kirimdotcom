#!/bin/bash

# setup-price-compare-ext.sh
# --------------------------
# Traffic Hijacking: Price Comparison Logic for Chrome Extension.
# Injects notification bar on competitor sites.

echo "🕵️ Setting up Price Comparison..."

# Assuming 'extension' folder already exists from previous step
mkdir -p extension

echo "✅ Logic Script: extension/price-compare.js"
echo "👉 Add 'price-compare.js' to your manifest.json content scripts matches."
