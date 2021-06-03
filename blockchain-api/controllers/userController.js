var userModel = require('../models/userModel.js');
var Wallet = require('../transaction_module/wallet');

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
                return res.status(201).json(user);
            }
        });
    },

    async function newTransaction(amunt,address, public_key){
        var usr=(public_key)=>userModel.findOne({public_key:public_key}).then(user=>user.private_key)
        var privKey = await usr(public_key);
        var usr2=(address)=>userModel.findOne({username:address}).then(user=>user.public_key)
        var address1 = await usr2(address);
        console.log(usr);
        var amount=parseInt(amount);

    }

    transaction: function(req, res, next){

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
