var userModel = require('../models/userModel.js');
const Wallet = require("../transaction_module/wallet");
const http = require('http');
const got = require('got');
var EC = require('elliptic').ec;
// we use the same preset of bitcoin, but should work with the other ones too
var ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
/*
async function newTransaction(amount,address, public_key) {
    var usr = (public_key) => userModel.findOne({public_key: public_key}).then(user => user.private_key)
    var privKey = await usr(public_key);
    var usr2 = (address) => userModel.findOne({username: address}).then(user => user.public_key)
    var address1 = await usr2(address);
    console.log(usr);
    var amount = parseInt(amount);

    let newTransaction = new Transaction();

    if(unspentTxIns.length === 0){
        newTransaction.txIns=[];

        if(amount > INITIAL_BALANCE){
            return;
        }

        newTransaction.txOuts=[];
        newTransaction.txOuts.push(new TxOut(address,amount));
        newTransaction.txOuts.push(new TxOut(this.publicKey,INITIAL_BALANCE-amount));
        newTransaction.senderAddress= this.publicKey;
        newTransaction.setTransactionId();

        //let signedData = this.sign(newTransaction.id); second option
        let signedData = this.toHexString(this.sign(newTransaction.id).toDER());
        console.log("Signed(true): "+ec.keyFromPublic(this.publicKey,'hex').verify(newTransaction.id,signedData));
        console.log("Signed(false): "+ec.keyFromPublic(this.publicKey,'hex').verify("newTransaction.id",signedData));
        console.log(newTransaction.id);

        newTransaction.signature=signedData;
        return newTransaction;


    }else{
        let spentTransactions = [];
        let sumAmount=0;
        let notEnoughMoney=false;

        let i=0;
        while(sumAmount < amount ){
            console.log("unspentTxIns[i]: "+JSON.stringify(unspentTxIns[i]));
            let txOut = unspentTxIns[i].txOuts.find(
                (t)=> t.address === this.publicKey
            );

            if(txOut){
                sumAmount =sumAmount+txOut.amount;
                spentTransactions.push(unspentTxIns[i]);
            }
            ++i;
            if(i === unspentTxIns.length){
                if(sumAmount < amount){
                    notEnoughMoney=true;
                }
                break;
            }
        }
        if(notEnoughMoney){
            console.log("Not enough money");
            return;
        }
        spentTransactions.forEach((t)=>{
            let txIn = new TxIn();
            txIn.transactionId = t.id;
            txIn.txOutIndex = t.txOuts.findIndex(
                (n) => n.address === this.publicKey
            );
            newTransaction.txIns.push(txIn);
        });

        let transferTxOut = new TxOut();
        transferTxOut.address = address;
        transferTxOut.amount = amount;
        newTransaction.txOuts.push((transferTxOut));
        let changeTxOut = new TxOut();
        changeTxOut.address = this.publicKey;
        changeTxOut.amount = sumAmount - amount;
        newTransaction.txOuts.push(changeTxOut);

        newTransaction.setTransactionId();
        newTransaction.signature=this.toHexString(this.sign(newTransaction.id).toDER());
        newTransaction.senderAddress = this.publicKey;
        return newTransaction;
    }

}
*/
const port = 3005;
const ip ='192.168.0.29';
var money;
async function getMoney2(senderAddress,receiverAddress,senderPrivateKey,amount) {
    const res = await got.post('http://' + ip + ':' + port + '/getMoney', {
        json: {address: senderAddress},
        responseType: "json"
    });
    const res2 = await got.post('http://' + ip + ':' + port + '/unspent-txIns', {
        json: {address: senderAddress},
        responseType: "json"
    });
    var availableMoney = JSON.parse(res.body)
    var unspentIns = JSON.stringify(res2.body)
    console.log("money:"+availableMoney)
    money=availableMoney;
    console.log("trans2 "+unspentIns)
    var wallet = new Wallet();
    var obj =   JSON.parse(unspentIns)
   // console.log("LLLL")
    //console.log(obj)
    //console.log(JSON.stringify(obj))
    let transakcija=wallet.createTransaction(obj,receiverAddress,amount,availableMoney,senderAddress,senderPrivateKey);
    console.log("IDEMOOOOO"+JSON.stringify(transakcija));

    var tranSTR  = JSON.stringify(transakcija);
    var options = {
        host: ip,
        port: port,
        path: '/newTransaction',
        method: 'POST',
        headers: {
            //'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(tranSTR)
        }
    };
    var req = http.request(options, function(res)
    {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log("statusna koda T: " + res.statusCode +" messge:"+res.statusMessage);
        });
        console.log("RESPONSE: "+res)
    });

    req.write(tranSTR);
    req.end();

}


async function getMoney(senderAddress) {
    const res = await got.post('http://' + ip + ':' + port + '/getMoney', {
        json: {address: senderAddress},
        responseType: "json"
    });

    return await JSON.parse(res.body);

}

async function getTransactions(senderAddress) {
    const res = await got.post('http://' + ip + ':' + port + '/v_transactions', {
        json: {address: senderAddress},
        responseType: "json"
    });
    console.log("tranzzzzzzz" + JSON.stringify(res.body))
    return await JSON.parse(res.body);

}
module.exports = {

    /**
     * userController.list()
     */
   /* transaction: function(req, res, next){
        var uspelo = await newTransaction(req.body.amount,req.body.username,req.session.publicKey);

        var private_key = await uspelo(public_key);

    },*/

    list: function (req, res) {
        userModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }
            return res.json(users);
        });
    },

    showLogin: function(req, res){
        res.render('user/login');
    },

    showRegister: function(req, res) {
        res.render('user/register');
    },

    login: function(req, res, next){
        userModel.authenticate(req.body.username, req.body.password, function(error, user){
            if(error || !user){
                var err = new Error("Wrong username or password");
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user.id;

                req.session.username = user.username;
                req.session.publicKey = user.public_key;
                console.log(req.session.publicKey);
                return res.status(201).json(user);
            }
        });
    },

    user: function (req, res) {
        var id = req.session.userId;
        userModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            return res.json(user);

        });
    },

    transactions: async function (req, res) {
        var sender = req.session.publicKey;
        var obj = await getTransactions(sender);
        return res.status(201).json(obj);
    },

    amount: async function (req, res) {
        var sender = req.session.publicKey;
        var obj = await getMoney(sender);
        console.log(obj);
        return res.status(201).json({
            amount : obj
        });
    },



     new_transaction:  async function (req,res){
        console.log("NEW TRANS")
        var user =req.body.username;
        var amount = req.body.amount;
        var sender = req.session.publicKey;
        var public_key;
       const obj= await userModel.findById(req.session.userId);
       const privatekey =obj.private_key;
        userModel.findOne({username: user}, function (err, user1) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting user.',
                        error: err
                    });
                }
                if (!user1) {
                    return res.status(404).json({
                        message: 'No such user'
                    });
                }
                public_key=user1.public_key;

                 getMoney2(sender,user1.public_key,privatekey,amount);

               // var unspentTxIns = getUnspentTxIns(public_key);
                //console.log("available money:"+availableMoney);
                //console.log("TxIns:"+ unspentTxIns);
                return res.status(201);


                var wallet = new Wallet();
                wallet.publicKey = user1.public_key;
                wallet.createTransaction()


        });
        console.log("Outside : "+public_key);
    },


    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        userModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {

        let wallet = new Wallet().initWallet();

        var user = new userModel({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password,
            private_key : wallet.privateKey,
            public_key: wallet.publicKey,

        });
        console.log(wallet.privateKey)
        console.log(wallet.publicKey)

        var initialTransaction = wallet.firstTransaction(wallet.publicKey)
        //const initialTransaction = wallet.createTransaction([],wallet.publicKey,0);
        console.log("INIT TRANS2"+JSON.stringify(initialTransaction));


        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }
            return res.status(201).json(user);
        });
        //TUKAJ NAREDIMO API NA VOUZLIŠČE
        var tranSTR  = JSON.stringify(initialTransaction);
        var options = {
            host: ip,
            port: port,
            path: '/newTransaction',
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(tranSTR)
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("statusna koda T: " + res.statusCode +" messge:"+res.statusMessage);
            });
            console.log("RESPONSE: "+res)
        });

        req.write(tranSTR);
        req.end();

    },


    logout: function(req,res,next){
        money=0;
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else {
                    //return res.redirect('/');
                    return res.status(200);
                }
            });
        }
    },

    getName: function(req, res,next) {
        userModel.findById(req.body.id)
            .exec(function (error,user){
            if(error){
                return next()
            } else {
                return res.json(user);
            }
        });
    },

    profile: function(req, res, next) {
        userModel.findById(req.session.userId)
            .exec(function(error, user){
                if(error){
                    return next(error);
                } else{
                    if(user === null){
                        var err = new Error("Not authenticated! Go back!");
                        err.status = 401;
                        return next(err);
                    } else{
                        res.render('user/profile', user);
                    }
                }
            });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        userModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
			user.email = req.body.email ? req.body.email : user.email;
			user.password = req.body.password ? req.body.password : user.password;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        userModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
