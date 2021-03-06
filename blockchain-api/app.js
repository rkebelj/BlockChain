/*const express = require('express');
const Blockchain = require('./chain/blockchain');
const bodyParser = require('body-parser');
const path = require("path");
const querystring = require("qs");
const http = require('http');
let Record = require('./record');
const fs = require('fs');
const  Wallet = require("./transaction_module/wallet")
//const {Transaction} = require('../transaction_module/transaction');
const {TxIn} = require('./transaction_module/transaction');
const {TxOut} = require('./transaction_module/transaction');
const EC = require('elliptic').ec;
// we use the same preset of bitcoin, but should work with the other ones too
const ec = new EC('secp256k1');*/


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/projekt';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');

var app = express();

//CORS
var cors = require('cors');
var allowedOrigins = ['http://localhost:3000','http://localhost:3001'];
app.use(cors({
    credentials: true,
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: mongoDB})
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;


/*
//using the blody parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());


//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000;
// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})
*/




/*
// create a new blockchain instance
const blockchain = new Blockchain();
// create a new wallet









var peers = [];
var records = [];
var wallets=[];
var unconfirmedTransactions=[];



//restoring chain
try {
    if(fs.existsSync('savedJSON/blockchain.json')) {
        fs.readFile('savedJSON/blockchain.json', 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }
            blockchain.chain = JSON.parse(data.toString());
            console.log('Chain restored');

        });
    } else {
        console.log('Chain not found');
    }
} catch (err) {
    console.error(err);
}
function isTransactionVerified(transactionId){
blockchain.chain.forEach(block =>{
    if(block.data.id === transactionId)
    {
        return false;
    }
});
return true;
}
function  getUnspentIns(address){
    let unspentTxIns = []
    blockchain.chain.forEach(block=>{
        const blockTransaction = block.data;
        console.log(block.data);
        if (blockTransaction.txOuts.find((t) => t.address === address)) {
            blockTransaction.txOuts.forEach((txOut, i) => {
                if (txOut.address === address) {
                    const txIn = new TxIn(blockTransaction.id,i);
                    //txIn.transactionId = blockTransaction.id;
                    //txIn.txOutIndex = i;
                    unspentTxIns.push(txIn);
                }
            });

            blockTransaction.txIns.forEach((txIn) => {
                const index = unspentTxIns.findIndex(
                    (txIn2) =>
                        txIn.transactionId === txIn2.transactionId &&
                        txIn.txOutIndex &&
                        txIn2.txOutIndex
                );
                if (index !== -1) {
                    unspentTxIns.splice(index, 1);
                }
            });
        }

    });
    return unspentTxIns;
}
function  getUnspentTransactions(address){
    const transactionIdToTxOutIndex = new Map();
    const unspentTransactions = [];
    blockchain.chain.forEach((block) => {
        const blockTransaction = block.data;
        const txOutIndex = blockTransaction.txOuts.findIndex((t) => t.address === address);
        if (txOutIndex !== -1) {
            unspentTransactions.push(blockTransaction);
            transactionIdToTxOutIndex.set(blockTransaction.id, txOutIndex);
            console.log(blockTransaction);
            blockTransaction.txIns.forEach((txIn) => {
                const index = unspentTransactions.findIndex((t) => t.id === txIn.transactionId &&
                    txIn.txOutIndex === transactionIdToTxOutIndex.get(t.id));
                if (index !== -1) {
                    unspentTransactions.splice(index, 1);
                }
            });
        }
    });
    return unspentTransactions;
}

function broadcastTransaction(transaction) {
    peers.forEach(peer => {
        console.log(peer);
        var ip = peer.split(':')[0];
        var port = peer.split(':')[1];
        transaction = JSON.stringify(transaction);
        //var data = JSON.stringify(transaction);
        //var data = transaction;


        var options = {
            host: ip,
            port: port,
            path: '/recievedTransaction',
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(transaction)
            }
        };
        console.log("OPTIONS: "+options);
        console.log("data sent: "+transaction);
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("statusna koda T: " + res.statusCode +" messge:"+res.statusMessage);
            });
        });

        req.write(transaction);
        req.end();

    });
}
function broadcastChain() {
    peers.forEach(peer => {
        console.log(peer);
        var ip = peer.split(':')[0];
        var port = peer.split(':')[1];
        var data = JSON.stringify(blockchain.chain);

        console.log("BROADCASTED data:");
        console.log(data);

        var options = {
            host: ip,
            port: port,
            path: '/replaceChain',
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("statusna koda: " + res.statusCode);
            });
        });

        req.write(data);
        req.end();

    });
}
function saveChainLocal(){
    fs.writeFile('savedJSON/blockchain.json', JSON.stringify(blockchain.chain), (err) => {
        if (err) {
            throw err;
        }
    });

}








//Requests

//GET
app.get('/chain',(req,res)=>{
    records.push(new Record("GET","/chain",req.connection.remoteAddress.split(":")[3],"-"));
    res.json(blockchain.chain);
});
app.get('/lastBlock',(req,res)=>{
    records.push(new Record("GET","/lastBlock",req.connection.remoteAddress.split(":")[3],"-"));
    res.json(blockchain.chain[blockchain.chain.length-1]);
});
app.get('/',(req,res)=>{
    //let a = new Record("GET","/",clientIP,"-")
   // console.log(a.toString());
    records.push(new Record("GET","/",req.connection.remoteAddress.split(":")[3],"-"));
    res.render('indeks');
});
app.get('/records',(req,res)=>{
    records.push(new Record("GET","/records",req.connection.remoteAddress.split(":")[3],"-"));
    res.json(records);
});
app.get('/peers',(req,res)=>{
    console.log("P2P list:");
    console.log(peers);
    records.push(new Record("GET","/peers",req.connection.remoteAddress.split(":")[3],"-"));
    res.json(peers);
});

app.get('/newOut',(req,res)=>{
    records.push(new Record("GET","/chain",req.connection.remoteAddress.split(":")[3],"-"));
    res.json(blockchain.chain);
});

//POST
app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    broadcastChain();
    saveChainLocal();

    console.log(blockchain.chain);
    records.push(new Record("POST","/mine",req.connection.remoteAddress.split(":")[3],req.body.data));
    res.redirect('/chain');
});

app.post('/connect', function (req,res){
   peers.push(req.body.ip+":"+req.body.port);
   records.push(new Record("POST","/connect",req.connection.remoteAddress.split(":")[3],req.body));
   res.redirect('/');
});


app.post('/replaceChain',(req,res)=>{
    records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
   if(req.body.length > blockchain.chain.length)
   {
       blockchain.chain = req.body;
   }
    res.redirect('/');
});
//---------------------------------------------------------------------------------------------------------------

app.post('/transaction',(req,res)=>{
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount,blockchain,transactionPool);
    console.log("transaction: "+transaction);
    //broadcastTransaction(transaction);
    res.json(transaction)
});

// get public key
app.get('/public-key',(req,res)=>{

    wallets.push(new Wallet());
    wallets.forEach(wallet =>{console.log(wallet.publicKey )})
    console.log("-----??????--------")
    res.json(wallets[wallets.length-1].publicKey);
});
app.post('/newTransaction',(req,res)=>{
    const { address,  amount } = req.body;
    //unconfirmedTransaction
    const transaction = getUnspentTransactions(wallets[wallets.length-1].publicKey);

    let transakcija = wallets[wallets.length-1].createTransaction(transaction,address,parseInt(amount));


    saveChainLocal()
    blockchain.addBlock(transakcija);
    broadcastChain();
    unconfirmedTransactions.push(transakcija);
    saveChainLocal();
    res.redirect('/chain');
});
app.get('/unspent-txIns/:address',(req,res)=>{
    let address = req.params.address

    /*
    let unspentTxIns = []
    blockchain.chain.forEach(block=>{
        const blockTransaction = block.data;
        console.log(block.data);
        if (blockTransaction.txOuts.find((t) => t.address === address)) {
            blockTransaction.txOuts.forEach((txOut, i) => {
                if (txOut.address === address) {
                    const txIn = new TxIn(blockTransrsraction.id,i);
                   //txIn.transactionId = blockTransaction.id;
                   //txIn.txOutIndex = i;
                    unspentTxIns.push(txIn);
                }
            });

            blockTransaction.txIns.forEach((txIn) => {
                const index = unspentTxIns.findIndex(
                    (txIn2) =>
                        txIn.transactionId === txIn2.transactionId &&
                        txIn.txOutIndex &&
                        txIn2.txOutIndex
                );
                if (index !== -1) {
                    unspentTxIns.splice(index, 1);
                }
            });
        }

    });


    res.send(getUnspentIns(address));
});
app.get('/unspent-transactions/:address',(req,res)=>{
    let address = req.params.address

    res.send(getUnspentTransactions(address));
});
app.post('/recievedTransaction',(req,res)=>{
    //records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
    console.log("TRANSACTION recieved: "+req.body);
    let transaction = req.body;
    console.log("???"+ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature));
    if(ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature))//preveri podpis
    {

        unconfirmedTransactions.push(transaction);
        //blockchain.addBlock(transaction);

    }
    //blockchain.addBlock(req.body);

    res.redirect('/');
});
app.get('/verify',(req,res)=>{
    //records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
    unconfirmedTransactions.forEach(transaction =>{
        console.log("should be true: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature));
        console.log("should be false: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify("transaction.id",transaction.signature));
    });
    res.redirect('/');
});
app.post('/getMoney',(req,res)=>{
    //records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
    //let address = req.body;
    const { address } = req.body;
    console.log("ADDRESS: "+ address);
    let total = 0;
   let money= getUnspentTransactions(address);
    console.log("money: "+ JSON.stringify(money));
    money.forEach(m =>{
        console.log(m);
    });
    console.log("total money is: "+total);
    res.json(total);
});

*/