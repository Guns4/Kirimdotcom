// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title LogisticsEscrow
 * @dev Holds funds until Oracle confirms delivery.
 */
contract LogisticsEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }

    struct Transaction {
        address payable buyer;
        address payable seller;
        uint256 amount;
        State state;
        string resi;
    }

    mapping(string => Transaction) public transactions; // resi -> Transaction
    address public oracle; // Trusted API Address

    event PaymentDeposited(string resi, address buyer, uint256 amount);
    event DeliveryConfirmed(string resi);
    event FundsReleased(string resi, address seller, uint256 amount);
    event Refunded(string resi, address buyer, uint256 amount);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only Oracle can call this");
        _;
    }

    modifier inState(string memory resi, State expectedState) {
        require(transactions[resi].state == expectedState, "Invalid state");
        _;
    }

    constructor() {
        oracle = msg.sender; // Deployer is default Oracle
    }

    function setOracle(address _oracle) external onlyOracle {
        oracle = _oracle;
    }

    // 1. Buyer deposits funds
    function deposit(string memory resi, address payable seller) external payable {
        require(transactions[resi].buyer == address(0), "Transaction already exists");
        require(msg.value > 0, "Amount must be > 0");

        transactions[resi] = Transaction({
            buyer: payable(msg.sender),
            seller: seller,
            amount: msg.value,
            state: State.AWAITING_DELIVERY,
            resi: resi
        });

        emit PaymentDeposited(resi, msg.sender, msg.value);
    }

    // 2. Oracle releases funds (Triggered by Webhook 'DELIVERED')
    function releaseFunds(string memory resi) external onlyOracle inState(resi, State.AWAITING_DELIVERY) {
        Transaction storage txn = transactions[resi];
        
        txn.state = State.COMPLETE;
        txn.seller.transfer(txn.amount);

        emit DeliveryConfirmed(resi);
        emit FundsReleased(resi, txn.seller, txn.amount);
    }

    // 3. Refund (Manual dispute resolution or cancellation)
    function refundBuyer(string memory resi) external onlyOracle inState(resi, State.AWAITING_DELIVERY) {
        Transaction storage txn = transactions[resi];

        txn.state = State.REFUNDED;
        txn.buyer.transfer(txn.amount);

        emit Refunded(resi, txn.buyer, txn.amount);
    }
}
