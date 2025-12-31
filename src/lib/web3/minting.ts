import { ethers } from 'ethers';

// Environment variables
const PRIVATE_KEY = process.env.WEB3_PRIVATE_KEY || ''; // Admin Wallet Key involved in minting
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POD_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_goerli';

// Minimal ABI
const ABI = [
    "function mintReceipt(string memory _resi, string memory _courier, address _seller, address _buyer, string memory _proofUrl) external"
];

export interface MintData {
    resi: string;
    courier: string;
    sellerAddress: string; // 0x...
    buyerAddress: string; // 0x...
    proofUrl: string;
}

export async function mintDeliveryReceipt(data: MintData) {
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
        console.warn('⚠️ Web3 Config missing. Skipping receipt minting.');
        return { success: false, error: 'Config missing' };
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        console.log(`⛓️ Minting Proof of Delivery for ${data.resi}...`);

        const tx = await contract.mintReceipt(
            data.resi,
            data.courier,
            data.sellerAddress,
            data.buyerAddress,
            data.proofUrl
        );

        console.log(`   Tx Hash: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Receipt Minted! Block: ${receipt.blockNumber}`);

        return { success: true, txHash: tx.hash, blockNumber: receipt.blockNumber };

    } catch (error: any) {
        console.error('❌ Minting Failed:', error);
        return { success: false, error: error.message };
    }
}
