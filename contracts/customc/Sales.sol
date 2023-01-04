// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "../ERC20Safe.sol";
import "../interfaces/IBridge.sol";

contract Sales is ERC20Safe {
    mapping(address => uint256) public usersBills;
    mapping(address => uint256) public usersDiscounts;
    bytes32 resourceID;
    address payable restaurant;
    address bridgeAddr;
    address paymentTokenAddr;
    address handlerAddr;

    event permissionReleased(address user, address restaurant, bytes data);

    constructor(
        address _bridgeAddr,
        address _paymentHandlerAddr,
        address _paymentTokenAddr,
        bytes32 _resourceID
    ) {
        restaurant = payable(msg.sender);
        bridgeAddr = _bridgeAddr;
        handlerAddr = _paymentHandlerAddr;
        paymentTokenAddr = _paymentTokenAddr;
        resourceID = _resourceID;
    }

    modifier checkUser() {
        require(usersBills[msg.sender] != 0);
        require(usersBills[msg.sender] == msg.value);
        _;
    }

    modifier isRestaurant() {
        require(
            (msg.sender) == restaurant || (msg.sender) == bridgeAddr,
            "Only the restaurant owner can set a bill/discount"
        );
        _;
    }

    function payBill() public payable checkUser {
        mintERC20(paymentTokenAddr, address(this), 1);
        ERC20PresetMinterPauser(paymentTokenAddr).approve(handlerAddr, 1);
        uint256 addressLenght = 20;
        bytes memory data = abi.encodePacked(
            uint256(1),
            uint256(addressLenght),
            address(msg.sender)
        );
        uint8 destinationChainID = 2;
        IBridge(bridgeAddr).deposit(destinationChainID, resourceID, data);
        emit permissionReleased(msg.sender, restaurant, data);
        delete usersBills[msg.sender];
    }

    function setUserBill(address user, uint256 bill) public isRestaurant {
        require(bill > 0, "Bill must be a positive number");
        usersBills[user] = bill;
    }

    function getBill() public view returns (uint256) {
        return usersBills[msg.sender];
    }

    function setUserDiscount(address user, uint256 discount)
        external
        isRestaurant
    {
        require(discount > 0, "Discount must be a positive number");
        usersDiscounts[user] = discount;
    }

    function getDiscount() public view returns (uint256) {
        return usersDiscounts[msg.sender];
    }

    function applyDiscount() external {
        if (usersBills[msg.sender] < usersDiscounts[msg.sender]) {
            usersBills[msg.sender] = 0;
            usersDiscounts[msg.sender] =
                usersDiscounts[msg.sender] -
                usersBills[msg.sender];
            return;
        }
        usersBills[msg.sender] =
            usersBills[msg.sender] -
            usersDiscounts[msg.sender];
        usersDiscounts[msg.sender] = 0;
    }

    function withdrawFunds() public isRestaurant {
        uint256 actualSales = address(this).balance;
        restaurant.transfer(actualSales);
    }

    function getDepositedFunds() public view isRestaurant returns (uint256) {
        return address(this).balance;
    }
}
