// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogisticsEscrow {
    address public oracle; // CekKirim System Address
    
    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        bool isCompleted;
        bool isRefunded;
    }

    mapping(string => Transaction) public escrows; // OrderID -> Transaction

    event Deposited(string indexed orderId, address indexed buyer, uint256 amount);
    event Released(string indexed orderId, address indexed seller, uint256 amount);
    event Refunded(string indexed orderId, address indexed buyer, uint256 amount);

    constructor(address _oracle) {
        oracle = _oracle;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only Oracle can call this");
        _;
    }

    function deposit(string memory _orderId, address _seller) public payable {
        require(escrows[_orderId].amount == 0, "Order already active");
        
        escrows[_orderId] = Transaction({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            isCompleted: false,
            isRefunded: false
        });

        emit Deposited(_orderId, msg.sender, msg.value);
    }

    // Called by CekKirim Oracle when API status == DELIVERED
    function releaseFunds(string memory _orderId) public onlyOracle {
        Transaction storage trx = escrows[_orderId];
        require(!trx.isCompleted, "Already completed");
        require(!trx.isRefunded, "Already refunded");

        trx.isCompleted = true;
        payable(trx.seller).transfer(trx.amount);

        emit Released(_orderId, trx.seller, trx.amount);
    }

    // Called by CekKirim Oracle when API status == LOST
    function refundBuyer(string memory _orderId) public onlyOracle {
        Transaction storage trx = escrows[_orderId];
        require(!trx.isCompleted, "Already completed");
        require(!trx.isRefunded, "Already refunded");

        trx.isRefunded = true;
        payable(trx.buyer).transfer(trx.amount);

        emit Refunded(_orderId, trx.buyer, trx.amount);
    }
}
