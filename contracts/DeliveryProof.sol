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
