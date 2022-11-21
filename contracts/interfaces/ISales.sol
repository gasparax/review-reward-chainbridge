// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;

/**
    @title Interface for Recensioni contract.
    @author ChainSafe Systems.
 */
interface ISales {

    function setUserDiscount(address user, uint256 discount) external;

}