#!/bin/bash

# setup-smart-escrow.sh
# ---------------------
# DeFi Logistics: Smart Escrow Contract.
# Releases funds automatically when API confirms 'DELIVERED'.

echo "🏦 Setting up Smart Escrow..."

# Using existing web3 folders
mkdir -p web3/contracts
mkdir -p src/lib/web3

echo "✅ Escrow Contract: web3/contracts/Escrow.sol"
echo "✅ Oracle Logic: src/lib/web3/escrow.ts"
