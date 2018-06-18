App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    // hasVoted: false,

    init: function () {

        this.initUpdatePage();

        //Get account details
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                this.account = account;
            }
        });

        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },

    initContract: function () {
        $.getJSON("DecentractClass.json", function (decentract) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.DecentractClass = TruffleContract(decentract);
            // Connect provider to interact with contract
            App.contracts.DecentractClass.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },
    initUpdatePage : function () {
        //Show contracts on homepage
        if ($('#contractDetail')) {
            App.showContracts();
        }

        //Show ethereumfield when action selected
        $("#manageContractSelect").change(function () {

            if ($('#manageContractSelect').val() == 'transferToContract' || $('#manageContractSelect').val() == 'supervisorWithdraw') {
                $('.manageContractEthFields').show();
            } else {
                $('.manageContractEthFields').hide();
            }

            if ($('#manageContractSelect').val() == 'supervisorWithdraw') {
                $('.manageContractReceiverFields').show();
            } else {
                $('.manageContractReceiverFields').hide();
            }
        });
    },
    bindEvents: function () {
        $(document).on('submit', '#manageContractGetId', App.manageContractGetId);
        $(document).on('submit', '#manageContractAction', App.manageContractAction);
        $(document).on('submit', '#createContract', App.createContract);
    },

    manageContractAction: function (e) {
        e.preventDefault();
        var decentrectId = parseInt($('#decentrectId').val());
        var action = $('#manageContractSelect').val();
        console.log(action);

        if (action == 'complete') {
            App.contracts.DecentractClass.deployed().then(function (instance) {
                return instance.complete(decentrectId);
            }).then(function (result) {
                console.log(result);
                $('#manageContractActionCard').hide();
                $('#manageContractRow').append('TX: ' + result.tx);
            }).catch(function (err) {
                console.error(err);
            });
        }
        if (action == 'dispute') {
            App.contracts.DecentractClass.deployed().then(function (instance) {
                console.log(instance);
                return instance.dispute(decentrectId);
            }).then(function (result) {
                console.log(result);
                $('#manageContractActionCard').hide();
                $('#manageContractRow').append('TX: ' + result.tx);
            }).catch(function (err) {
                console.error(err);
            });
        }
        if (action == 'transferToContract') {
            var wei = web3.toWei($('#manageContractEth').val(), "ether");
            App.contracts.DecentractClass.deployed().then(function (instance) {
                return instance.sendTransaction({from: account, value: wei})
            }).then(function (result) {
                console.log(result);
                $('#manageContractActionCard').hide();
                $('#manageContractRow').append('TX: ' + result.tx);
            }).catch(function (err) {
                console.error(err);
            });
        }
        if (action == 'withdrawFromContract') {
            App.contracts.DecentractClass.deployed().then(function (instance) {
                return instance.withdrawFromContract(decentrectId);
            }).then(function (result) {
                console.log(result);
                $('#manageContractActionCard').hide();
                $('#manageContractRow').append('TX: ' + result.tx);
            }).catch(function (err) {
                console.error(err);
            });
        }
        if (action == 'supervisorWithdraw') {
            // var wei = web3.toWei($('#manageContractEth').val(), "ether");
            // App.contracts.DecentractClass.deployed().then(function (instance) {
            //     return instance.sendTransaction({from: account, value: wei})
            // }).then(function (result) {
            //     console.log(result);
            //     $('#manageContractActionCard').hide();
            //     $('#manageContractRow').append('TX: ' + result.tx);
            // }).catch(function (err) {
            //     console.error(err);
            // });
        }


    },

    manageContractGetId: function (e) {
        e.preventDefault();
        var decentrectId = parseInt($('#decentrectId').val());

        App.contracts.DecentractClass.deployed().then(function (instance) {
            decentractInstance = instance;
            return decentractInstance.decentracts(decentrectId);
        }).then(function (decentract) {
            console.log(decentract);

            var id = decentract[0];
            var balance = decentract[1];
            var buyer = decentract[2];
            var seller = decentract[3];
            var supA = decentract[4];
            var supB = decentract[5];
            var supC = decentract[6];
            var disputedByBuyer = decentract[7];
            var disputedBySeller = decentract[8];
            var completedByBuyer = decentract[9];
            var completedBySeller = decentract[10];
            var qualitySpecifics = decentract[11];
            var deliverDate = decentract[12];

            var detailHtml = '<div class="card text-center">' +
                '<div class="card-header">' +
                'Decentract ' + id +
                '</div>' +
                '<div class="card-body">' +
                '<h5 class="card-title">Balance: ' + balance + '</h5>' +
                '<p class="card-text">' + qualitySpecifics + '</p>' +
                '<table class="table"><tbody>' +
                '<tr><td>Buyer</td><td>' + buyer + '</td></tr>' +
                '<tr><td>Seller</td><td>' + seller + '</td></tr>' +
                '<tr><td>Supervisor 1</td><td>' + supA + '</td></tr>' +
                '<tr><td>Supervisor 2</td><td>' + supB + '</td></tr>' +
                '<tr><td>Supervisor 3</td><td>' + supC + '</td></tr>';

            if (disputedByBuyer == false && disputedBySeller == false) {
                detailHtml += '<span class="badge badge-success">No Disputes</span>'
            } else {
                detailHtml += '<span class="badge badge-danger">Disputed</span>'
            }

            if (completedByBuyer == true && completedBySeller == true) {
                detailHtml += '<span class="badge badge-success">Completed</span>'
            } else {
                detailHtml += '<span class="badge badge-danger">Not Completed</span>'
            }

            detailHtml += '</tbody></table>' +
                '</div>' +
                '<div class="card-footer text-muted">' +
                'Deadline: ' + deliverDate +
                '</div>' +
                '</div>';

            var detailsContract = $('#detailsContract');
            $('#manageContractGetId').hide();
            $('#manageContractActionCard').show();
            detailsContract.prepend(detailHtml);

        });
    },

    showContracts: function () {
        var decentractInstance;
        App.contracts.DecentractClass.deployed().then(function (instance) {
            decentractInstance = instance;
            return decentractInstance.decentractCount();
        }).then(function (decentractCount) {

            var contractDetail = $('#contractDetail');
            contractDetail.empty();

            for (var i = 1; i <= decentractCount; i++) {
                decentractInstance.decentracts(i).then(function (decentract) {
                    var id = decentract[0];
                    var balance = decentract[1];
                    var buyer = decentract[2];
                    var seller = decentract[3];
                    var disputedByBuyer = decentract[7];
                    var disputedBySeller = decentract[8];
                    var completedByBuyer = decentract[9];
                    var completedBySeller = decentract[10];

                    if (disputedByBuyer == false && disputedBySeller == false) {

                    }

                    var contractDetailCard = '<div class=" col-sm-3"><div class="card"><div class="card-body">' +
                        '<h5 class="card-title">Decentract ' + id + '</h5> <h6 class="card-subtitle">Balance: ' + balance + '</h6> ' +
                        '<p class="card-text">Buyer: ' + buyer + '<br>Seller: ' + seller + '<br> ';

                    if (disputedByBuyer == false && disputedBySeller == false) {
                        contractDetailCard += '<span class="badge badge-success">No Disputes</span>'
                    } else {
                        contractDetailCard += '<span class="badge badge-danger">Disputed</span>'
                    }

                    if (completedByBuyer == true && completedBySeller == true) {
                        contractDetailCard += '<span class="badge badge-success">Completed</span>'
                    } else {
                        contractDetailCard += '<span class="badge badge-danger">Not Completed</span>'
                    }

                    contractDetailCard += '</p></div></div></div>';
                    contractDetail.append(contractDetailCard);
                });
            }
        });
    },

    createContract: function (e) {
        e.preventDefault();

        App.contracts.DecentractClass.deployed().then(function (instance) {

            console.log(instance);

            let buyer = $('#ethAddressBuyer').val();
            let seller = $('#ethAddressSeller').val();
            let supA = $('#ethAddressRegulatorA').val();
            let supB = $('#ethAddressRegulatorB').val();
            let supC = $('#ethAddressRegulatorC').val();

            let qualitySpecifics = $('#qualitySpecifics').val();
            let deliverDate = $('#deliverDate').val();

            return instance.newDecentract(buyer, seller, supA, supB, supC, qualitySpecifics, deliverDate);
        }).then(function (result) {
            console.log(result);

            $('#createContract').hide();
            $('#formCreated').append('TX: ' + result.tx);

            // Wait for votes to update
            // $("#content").hide();
            // $("#loader").show();
        }).catch(function (err) {
            console.error(err);
        });
    }
};

jQuery(function ($) {
    App.init();
});
