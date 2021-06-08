var userModel = require('../models/userModel.js');
var Wallet = require('../transaction_module/wallet');




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
    

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
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
                req.session.userId = user._id;
                req.session.username = user.username;
                req.session.publicKey = user.publicKey;
                return res.status(201).json(user);
            }
        });
    },

    transaction: function(req, res, next){
        var uspelo = await newTransaction(req.body.amount,req.body.username,req.session.publicKey);
        
        var private_key = await uspelo(public_key);
        
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

        var wallet = new Wallet();
        console.log("KEYYS:");
        console.log(wallet.keyPair.getPrivate().toString());
        console.log(wallet.publicKey);


        var user = new userModel({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password,
            private_key : wallet.keyPair.getPrivate().toString(),
            public_key: wallet.publicKey,

        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }
            return res.status(201).json(user);
        });
    },


    logout: function(req,res,next){
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
