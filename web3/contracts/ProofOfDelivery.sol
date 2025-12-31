// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ProofOfDelivery
 * @dev Stores immutable delivery records (receipts) on-chain.
 */
contract ProofOfDelivery {
    struct Receipt {
        string resi;
        string courier;
        address seller;
        address buyer;
        uint256 timestamp;
        string status; // 'DELIVERED'
        string proofUrl; // IPFS or Image URL
    }

    mapping(string => Receipt) public receipts; // resi -> Receipt
    event ReceiptMinted(string indexed resi, address indexed seller, uint256 timestamp);

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can mint");
        _;
    }

    function mintReceipt(
        string memory _resi,
        string memory _courier,
        address _seller,
        address _buyer,
        string memory _proofUrl
    ) external onlyAdmin {
        require(bytes(receipts[_resi].resi).length == 0, "Receipt already exists");

        receipts[_resi] = Receipt({
            resi: _resi,
            courier: _courier,
            seller: _seller,
            buyer: _buyer,
            timestamp: block.timestamp,
            status: "DELIVERED",
            proofUrl: _proofUrl
        });

        emit ReceiptMinted(_resi, _seller, block.timestamp);
    }

    function getReceipt(string memory _resi) external view returns (Receipt memory) {
        return receipts[_resi];
    }
}
