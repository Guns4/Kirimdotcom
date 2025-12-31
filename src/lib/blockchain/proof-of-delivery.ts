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
