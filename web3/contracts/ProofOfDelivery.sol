// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofOfDelivery {
    struct Receipt {
        string orderId;
        string recipientName;
        uint256 timestamp;
        string metadataIpfsUrl;
    }

    mapping(string => Receipt) public receipts; // orderId -> Receipt
    mapping(address => string[]) public sellerReceipts;

    event ReceiptMinted(string indexed orderId, address indexed seller, uint256 timestamp);

    function mintReceipt(string memory _orderId, string memory _recipient, string memory _ipfsUrl) public {
        require(bytes(receipts[_orderId].orderId).length == 0, "Receipt already exists");

        Receipt memory newReceipt = Receipt({
            orderId: _orderId,
            recipientName: _recipient,
            timestamp: block.timestamp,
            metadataIpfsUrl: _ipfsUrl
        });

        receipts[_orderId] = newReceipt;
        sellerReceipts[msg.sender].push(_orderId);

        emit ReceiptMinted(_orderId, msg.sender, block.timestamp);
    }

    function getReceipt(string memory _orderId) public view returns (Receipt memory) {
        return receipts[_orderId];
    }
}
