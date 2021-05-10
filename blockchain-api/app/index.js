const express = require('express');
const Blockchain = require('../chain/blockchain');
const bodyParser = require('body-parser');
const path = require("path");
const querystring = require("qs");
const http = require('http');
let Record = require('../record');
const fs = require('fs');
const  Wallet = require("../transaction_module/wallet")
const TransactionPool = require('../transaction_module/unspentTransactions');


//create a new app
const app  = express();
// view engine setup

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

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


// create a new blockchain instance
const blockchain = new Blockchain();
// create a new wallet
const wallet = new Wallet();

// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();



var peers = [];
var records = [];

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

function broadcastTransaction() {
    console.log("LOL=")
    peers.forEach(peer => {
        console.log(peer);
        var ip = peer.split(':')[0];
        var port = peer.split(':')[1];
        var data = JSON.stringify(transactionPool.transactions);


        var options = {
            host: ip,
            port: port,
            path: '/synchTransactions',
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        console.log("OPTIONS: "+options);
        console.log("data sent: "+data);
        var req = http.request(options, function(res)
        {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("statusna koda T: " + res.statusCode +" messge:"+res.statusMessage);
            });
        });

        req.write(data);
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
    res.json({publicKey: wallet.publicKey});
})
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});
app.get('/bt',(req,res)=>{
    broadcastTransaction()
    res.json(transactionPool.transactions);
});
app.post('/synchTransactions',(req,res)=>{
   // records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
   console.log(req.body);
    transactionPool.transactions.push(req.body)
    res.redirect('/');
});

