// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "../interfaces/IBridge.sol";

contract Sales {
    mapping(address => uint256) public usersBills;
    mapping(address => uint256) public usersDiscounts;
    bytes32 resourceID;
    address payable restaurant;
    address bridgeAddr;
    address paymentTokenAddr;
    address handlerAddr;

    event permissionReleased(address customer, address restaurant, bytes data);
    event NewBill(address customer, uint256 bill);

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
        require(
            msg.value == usersBills[msg.sender] - usersDiscounts[msg.sender] || msg.value == 0,
            "Pass as value the current customer bill" 
        );
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
        ERC20PresetMinterPauser(paymentTokenAddr).burnFrom(msg.sender, usersDiscounts[msg.sender]);
        usersDiscounts[msg.sender] = 0;
        ERC20PresetMinterPauser(paymentTokenAddr).mint(address(this), 1);
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

    function getBill() public view returns (uint256){
        if (usersDiscounts[msg.sender] > 0) {
            if (usersBills[msg.sender] < usersDiscounts[msg.sender]) {
                return 0;
            } else {
                return usersBills[msg.sender] - usersDiscounts[msg.sender];
            }
        }
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
    
    function withdrawFunds() public isRestaurant {
        uint256 actualSales = address(this).balance;
        restaurant.transfer(actualSales);
    }

    function getDepositedFunds() public view isRestaurant returns (uint256) {
        return address(this).balance;
    }
}