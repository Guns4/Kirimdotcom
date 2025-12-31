import { ethers } from 'ethers';

// Environment variables should be set in .env.local
const PRIVATE_KEY = process.env.WEB3_PRIVATE_KEY || ''; // Oracle Wallet Key
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_goerli'; // Example

// Minimal ABI
const ABI = [
    "function releaseFunds(string memory resi) external"
];

export async function releaseEscrow(resi: string) {
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
        console.warn('⚠️ Web3 Escrow Config missing. Skipping blockchain release.');
        return { success: false, error: 'Config missing' };
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        console.log(`🏦 Releasing funds for Resi: ${resi}...`);

        // Call Smart Contract
        const tx = await contract.releaseFunds(resi);
        console.log(`   Tx Hash: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Funds Released! Block: ${receipt.blockNumber}`);

        return { success: true, txHash: tx.hash };

    } catch (error: any) {
        console.error('❌ Escrow Release Failed:', error);
        return { success: false, error: error.message };
    }
}
