var DContract = artifacts.require("./DecentractClass.sol");

module.exports = function(deployer, network, accounts) {
    // const buyer = accounts[1];
    // const seller = accounts[2];
    // const sup1 = accounts[3];
    // const sup2 = accounts[4];
    // const sup3 = accounts[5];
    deployer.deploy(DContract);
};
