var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

function requiresLogin(req, res, next){
    if(req.session){
        return next();
    } else {
        console.log(req.session);
        var err = new Error("You must be logged in to view this page.");
        err.status = 401;
        return next(err);
    }
}

/*
 * GET
 */
router.get('/', userController.list);
router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.get('/profile', userController.profile);
router.get('/logout', userController.logout);
router.get('/user',requiresLogin,userController.user);
router.get('/transactions',requiresLogin,userController.transactions);

/*
 * GET
 */
router.get('/:id', userController.show);

/*
 * POST
 */
router.post('/', userController.create);
router.post('/login', userController.login);

/*
 * PUT
 */
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
