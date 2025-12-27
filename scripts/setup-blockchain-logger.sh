#!/bin/bash

# Setup Blockchain Proof of Delivery Logger
echo "🚀 Setting up Blockchain Proof of Delivery..."

# 1. Install Dependencies
echo "📦 Installing ethers.js..."
npm install ethers

# 2. Create Smart Contract (Solidity - for reference)
echo "📝 Creating Smart Contract Reference..."
mkdir -p contracts
cat << 'EOF' > contracts/DeliveryProof.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeliveryProof {
    struct Delivery {
        string trackingNumber;
        string status;
        uint256 timestamp;
        string deliveryHash;
    }
    
    mapping(string => Delivery) public deliveries;
    
    event DeliveryLogged(
        string indexed trackingNumber,
        string status,
        uint256 timestamp,
        string deliveryHash
    );
    
    function logDelivery(
        string memory _trackingNumber,
        string memory _status,
        string memory _deliveryHash
    ) public {
        deliveries[_trackingNumber] = Delivery({
            trackingNumber: _trackingNumber,
            status: _status,
            timestamp: block.timestamp,
            deliveryHash: _deliveryHash
        });
        
        emit DeliveryLogged(_trackingNumber, _status, block.timestamp, _deliveryHash);
    }
    
    function verifyDelivery(string memory _trackingNumber) public view returns (
        string memory status,
        uint256 timestamp,
        string memory deliveryHash
    ) {
        Delivery memory d = deliveries[_trackingNumber];
        return (d.status, d.timestamp, d.deliveryHash);
    }
}
EOF

# 3. Create Blockchain Service
echo "⛓️ Creating Blockchain Service..."
mkdir -p src/lib/blockchain
cat << 'EOF' > src/lib/blockchain/proof-of-delivery.ts
import { ethers } from 'ethers'

// Deployed contract address (replace with actual after deployment)
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Contract ABI (minimal for our needs)
const CONTRACT_ABI = [
    "function logDelivery(string _trackingNumber, string _status, string _deliveryHash) public",
    "function verifyDelivery(string _trackingNumber) public view returns (string status, uint256 timestamp, string deliveryHash)",
    "event DeliveryLogged(string indexed trackingNumber, string status, uint256 timestamp, string deliveryHash)"
]

export class BlockchainLogger {
    private provider: ethers.JsonRpcProvider
    private contract: ethers.Contract
    private wallet?: ethers.Wallet

    constructor() {
        // Use Polygon Mumbai testnet (free) or Polygon mainnet
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
        this.provider = new ethers.JsonRpcProvider(rpcUrl)

        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider)

        // Wallet for signing transactions (admin only)
        if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider)
        }
    }

    async logDeliveryToBlockchain(trackingNumber: string, status: string, metadata: any) {
        if (!this.wallet) {
            throw new Error('Blockchain wallet not configured')
        }

        try {
            // Create hash of delivery data
            const deliveryData = JSON.stringify({
                trackingNumber,
                status,
                timestamp: new Date().toISOString(),
                ...metadata
            })
            const deliveryHash = ethers.keccak256(ethers.toUtf8Bytes(deliveryData))

            // Connect contract with wallet
            const contractWithSigner = this.contract.connect(this.wallet)

            // Submit transaction
            const tx = await contractWithSigner.logDelivery(trackingNumber, status, deliveryHash)
            const receipt = await tx.wait()

            return {
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                deliveryHash
            }
        } catch (error: any) {
            console.error('Blockchain logging failed:', error)
            throw new Error(`Failed to log to blockchain: ${error.message}`)
        }
    }

    async verifyDeliveryOnBlockchain(trackingNumber: string) {
        try {
            const [status, timestamp, deliveryHash] = await this.contract.verifyDelivery(trackingNumber)

            return {
                trackingNumber,
                status,
                timestamp: Number(timestamp),
                deliveryHash,
                verified: true
            }
        } catch (error: any) {
            return {
                trackingNumber,
                verified: false,
                error: error.message
            }
        }
    }

    async getTransactionDetails(txHash: string) {
        try {
            const tx = await this.provider.getTransaction(txHash)
            const receipt = await this.provider.getTransactionReceipt(txHash)

            return {
                tx,
                receipt,
                confirmations: receipt?.confirmations || 0
            }
        } catch (error: any) {
            throw new Error(`Failed to get transaction: ${error.message}`)
        }
    }
}

// Singleton instance
export const blockchainLogger = new BlockchainLogger()
EOF

# 4. Create Server Action
echo "⚡ Creating Blockchain Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/blockchain.ts
'use server'

import { safeAction } from '@/lib/safe-action'
import { blockchainLogger } from '@/lib/blockchain/proof-of-delivery'
import { createClient } from '@/utils/supabase/server'

export const logDeliveryProof = async (trackingNumber: string, status: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Get delivery metadata
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('tracking_number', trackingNumber)
            .single()

        if (!order) throw new Error('Order not found')

        // Log to blockchain
        const result = await blockchainLogger.logDeliveryToBlockchain(
            trackingNumber,
            status,
            {
                recipient: order.customer_name,
                courier: order.courier || 'Unknown',
                deliveredBy: user.email
            }
        )

        // Save blockchain tx hash to database
        await supabase.from('orders').update({
            blockchain_tx_hash: result.txHash,
            blockchain_verified: true
        }).eq('tracking_number', trackingNumber)

        return result
    })
}

export const verifyDeliveryProof = async (trackingNumber: string) => {
    return safeAction(async () => {
        const result = await blockchainLogger.verifyDeliveryOnBlockchain(trackingNumber)
        return result
    })
}
EOF

# 5. Create UI Component
echo "🎨 Creating Blockchain Verification UI..."
mkdir -p src/components/blockchain
cat << 'EOF' > src/components/blockchain/BlockchainProof.tsx
'use client'

import { useState } from 'react'
import { logDeliveryProof, verifyDeliveryProof } from '@/app/actions/blockchain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function BlockchainProof({ trackingNumber, status }: { trackingNumber: string, status: string }) {
    const [proof, setProof] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleLogToBlockchain = async () => {
        setLoading(true)
        try {
            const result = await logDeliveryProof(trackingNumber, status)
            if (result?.data) {
                setProof(result.data)
                toast.success('Delivery proof logged to blockchain!')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to log to blockchain')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        setLoading(true)
        try {
            const result = await verifyDeliveryProof(trackingNumber)
            if (result?.data) {
                setProof(result.data)
                if (result.data.verified) {
                    toast.success('Delivery verified on blockchain!')
                } else {
                    toast.warning('No blockchain record found')
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Shield className="w-5 h-5" />
                    Blockchain Proof of Delivery
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!proof ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Log delivery status to blockchain for immutable proof
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleLogToBlockchain} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                                {loading ? 'Processing...' : 'Log to Blockchain'}
                            </Button>
                            <Button onClick={handleVerify} disabled={loading} variant="outline">
                                Verify Existing Proof
                            </Button>
                        </div>
                    </div>
                ) : proof.verified ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-700">Verified on Blockchain</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge>{proof.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Timestamp:</span>
                                <span>{new Date(proof.timestamp * 1000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Hash:</span>
                                <span className="font-mono text-xs">{proof.deliveryHash?.slice(0, 20)}...</span>
                            </div>
                        </div>

                        {proof.txHash && (
                            <a 
                                href={`https://mumbai.polygonscan.com/tx/${proof.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                            >
                                View on PolygonScan
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        No blockchain record found for this tracking number
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    Anti-fraud protection: Delivery records are immutably stored on Polygon blockchain
                </p>
            </CardContent>
        </Card>
    )
}
EOF

echo "✅ Blockchain Proof of Delivery Setup Complete!"
echo "⛓️ Delivery status akan tersimpan di blockchain (anti-fraud)!"
echo "👉 Set BLOCKCHAIN_PRIVATE_KEY and BLOCKCHAIN_CONTRACT_ADDRESS in .env.local"
echo "👉 Deploy contract to Polygon Mumbai testnet first"
