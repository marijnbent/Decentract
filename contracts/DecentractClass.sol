pragma solidity ^0.4.17;

contract DecentractClass {

    struct Decentract {
        uint id;
        uint balance;
        address buyer;
        address seller;
        address supervisorA;
        address supervisorB;
        address supervisorC;

        bool disputedByBuyer;
        bool disputedBySeller;
        bool completedByBuyer;
        bool completedBySeller;

        string qualitySpecs;
        string deadline;
    }

    uint public decentractCount;
    mapping(uint => Decentract) public decentracts;

    constructor() public {
    }

    function newDecentract(address _buy, address _sell, address _supA, address _supB, address _supC, string qualitySpecs, string deadline) public returns (uint) {
        decentractCount++;
        decentracts[decentractCount] = Decentract(decentractCount, 0, _buy, _sell, _supA, _supB, _supC, false, false, false, false, qualitySpecs, deadline);
        return decentractCount;
    }

    function complete(uint decentractId) public {
        require(allowedToRun(1, decentractId, msg.sender), 'You are not allowed to run this function.');

        if (msg.sender == decentracts[decentractId].buyer) {
            decentracts[decentractId].completedByBuyer = true;
        } else if (msg.sender == decentracts[decentractId].seller) {
            decentracts[decentractId].completedBySeller = true;
        }
    }

    function dispute(uint decentractId) public {
        require(allowedToRun(1, decentractId, msg.sender), 'You are not allowed to run this function.');

        if (msg.sender == decentracts[decentractId].buyer) {
            decentracts[decentractId].disputedByBuyer = true;
        } else if (msg.sender == decentracts[decentractId].seller) {
            decentracts[decentractId].disputedBySeller = true;
        }
    }

    function transferToContract(uint decentractId) public payable {
        require(allowedToRun(1, decentractId, msg.sender), 'You are not allowed to run this function.');

        if (msg.sender == decentracts[decentractId].buyer) {
            decentracts[decentractId].balance += msg.value;
        }
    }

    //withdraw ETH from the contract
    //only possible when both parties completed the contract and there are no disputes
    function withdrawFromContract(uint decentractId) public {
        require(allowedToRun(1, decentractId, msg.sender),
            'You are not allowed to run this function.');

        require(decentracts[decentractId].disputedByBuyer != true && decentracts[decentractId].disputedBySeller != true,
            "Contract is disputed");
        require(decentracts[decentractId].completedByBuyer == true && decentracts[decentractId].completedBySeller == true,
            "Both parties need to complete()");

        uint amount = decentracts[decentractId].balance;
        decentracts[decentractId].seller.transfer(amount);
    }

    //send a certain amount to an address
    //only available by a supervisor when the contract is disputed
    //TODO: let a supervisor propose a solution (== transaction(s)) and let
    //other supervisors vote. When 2 votes
    function supervisorWithdraw(uint decentractId, uint amount, address receiver) public {
        require(allowedToRun(2, decentractId, msg.sender), 'You are not allowed to run this function.');

        require(decentracts[decentractId].disputedByBuyer == true || decentracts[decentractId].disputedBySeller == true,
            "Contract is not disputed");

        uint balance = decentracts[decentractId].balance;
        require(balance-amount >= 0, 'Balance is too low');

        receiver.transfer(amount);
    }

    //tier1 == buyer/seller
    //tier2 == supervisors
    function allowedToRun(uint _case, uint _decentractId, address _sender) private view returns (bool) {
        if (_case==1) {
            if (_sender == decentracts[_decentractId].buyer || _sender == decentracts[_decentractId].seller) {
                return true;
            }
        }
        if (_case==2) {
            if (_sender == decentracts[_decentractId].supervisorA || _sender == decentracts[_decentractId].supervisorB || _sender == decentracts[_decentractId].supervisorC) {
                return true;
            }
        }
        return false;
    }
}