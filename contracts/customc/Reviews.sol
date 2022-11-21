// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "../ERC20Safe.sol";
import "../interfaces/IBridge.sol";

contract Reviews is ERC20Safe {
    mapping(address => uint8) public usersReviews;
    mapping(address => bool) public usersPermissions;
    bytes32 resourceID;
    address payable restaurant;
    address bridgeAddr;
    address permissionTokenAddr;
    address handlerAddr;
    uint256 reward = 20;
    uint256 reviewsSum;
    uint256 reviewsNumber;

    event reviewRilasciata(address user, uint256 vote);

    event descountReleased(address user, uint256 rewardReleased);

    constructor(
        address _bridgeAddr,
        address _permissionHandlerAddr,
        address _permissionTokenAddr,
        bytes32 _resourceID
    ) {
        restaurant = payable(msg.sender);
        permissionTokenAddr = _permissionTokenAddr;
        bridgeAddr = _bridgeAddr;
        handlerAddr = _permissionHandlerAddr;
        resourceID = _resourceID;
    }

    modifier isRestaurant() {
        require(
            (msg.sender) == restaurant || (msg.sender) == bridgeAddr,
            "Only the restaurant owner can set a permission/reward"
        );
        _;
    }

    modifier permission() {
        // require(ERC20Safe(permissionTokenAddr).balanceOf(msg.sender) > 0);
        require(usersPermissions[msg.sender] == true);
        _;
    }

    function reviewRestaurant(uint8 vote) public payable permission {
        require(vote >= 0 && vote <= 10, "Vote must be a value between 0 and 10");
        /* ERC20PresetMinterPauser(permissionTokenAddr).burnFrom(msg.sender, 1); */
        mintERC20(permissionTokenAddr, address(this), reward);
        ERC20PresetMinterPauser(permissionTokenAddr).approve(
            handlerAddr,
            reward
        );
        if (usersReviews[msg.sender] == 0) {
            reviewsSum += vote;
            reviewsNumber++;
        } else {
            reviewsSum -= usersReviews[msg.sender];
            reviewsSum += vote;
        }
        usersReviews[msg.sender] = vote;
        delete usersPermissions[msg.sender];
        emit reviewRilasciata(msg.sender, vote);
        uint256 addressLenght = 20;
        bytes memory data = abi.encodePacked(
            uint256(reward),
            uint256(addressLenght),
            address(msg.sender)
        );
        uint8 destinationChainID = 1;
        IBridge(bridgeAddr).deposit(destinationChainID, resourceID, data);
        emit descountReleased(msg.sender, reward);
    }

    function setUserPermission(address user) external isRestaurant {
        usersPermissions[user] = true;
    }

    function checkPermission() public view returns (bool) {
        return usersPermissions[msg.sender];
    }

    function setReward(uint256 rewardAmount) external isRestaurant {
        require(rewardAmount > 0, "The reward must be a value greater than 0");
        reward = rewardAmount;
    }

    function getReward() public view returns (uint256) {
        return reward;
    }

    function getReviewsSum() public view returns (uint256) {
        return reviewsSum;
    }

    function getReviewsNumber() public view returns (uint256) {
        return reviewsNumber;
    }


}
