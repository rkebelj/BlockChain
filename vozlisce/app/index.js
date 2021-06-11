const express = require('express');
const Blockchain = require('../chain/blockchain');
const bodyParser = require('body-parser');
const path = require("path");
const querystring = require("qs");
const http = require('http');
let Record = require('../record');
const fs = require('fs');
const  Wallet = require("../transaction_module/wallet")
//const {Transaction} = require('../transaction_module/transaction');
const {TxIn} = require('../transaction_module/transaction');
const {TxOut} = require('../transaction_module/transaction');
const EC = require('elliptic').ec;
// we use the same preset of bitcoin, but should work with the other ones too
const ec = new EC('secp256k1');


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
const HTTP_PORT = process.env.HTTP_PORT || 3005;
// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})


// create a new blockchain instance
const blockchain = new Blockchain();
// create a new wallet

var verifiedTransactions = [];









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

try {
    if(fs.existsSync('savedJSON/transaction.json')) {
        fs.readFile('savedJSON/transaction.json', 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }
            verifiedTransactions = JSON.parse(data.toString());
            console.log('Transaction restored');

        });
    } else {
        console.log('Transaction not found');
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
            blockTransaction.txIns.forEach((txIn) => {
                const index = unspentTransactions.findIndex((t) => t.id === txIn.transactionId &&
                    txIn.txOutIndex === transactionIdToTxOutIndex.get(t.id));
                if (index !== -1) {
                    unspentTransactions.splice(index, 1);
                }
            });
        }
    });
    console.log("WTF")
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

function saveTransactionLocal(){
    fs.writeFile('savedJSON/transaction.json', JSON.stringify(verifiedTransactions), (err) => {
        if (err) {
            throw err;
        }
    });

}








//Requests

//GET
app.post('/v_transactions',(req,res)=>{
    var address = req.body.address;

    records.push(new Record("GET","/v_transactions",req.connection.remoteAddress.split(":")[3],"-"));
    var mytrans = [];

    verifiedTransactions.forEach(transaction =>{

        if(transaction.senderAddress == address) {
            mytrans.push(transaction);
        }
    });
    res.json(JSON.stringify(mytrans));
});
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



// get public key
app.get('/public-key',(req,res)=>{

    var wallet= new Wallet();
    console.log(wallet.publicKey )
    console.log(wallet.keyPair.getPrivateKey().toString())
    res.json(wallets[wallets.length-1].publicKey);
});

app.post('/newTransaction',(req,res)=>{
    console.log(req.body)
    //unconfirmedTransaction
    const transaction = req.body;
    console.log("kua?: "+!(transaction.id==='first transaction id'))
    if(!(transaction.id=='first transaction id')){
        console.log("LOL")
        // console.log("FALSE: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify("newTransaction.id",transaction.signature));
        // console.log("TRUE: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature));
        console.log(transaction)
        console.log("VERIFIED?"+Wallet.verifySignature(transaction.senderAddress,transaction.signature,transaction.id))
        if(Wallet.verifySignature(transaction.senderAddress,transaction.signature,transaction.id))
        {
            verifiedTransactions.push(transaction);
            console.log(verifiedTransactions.length);
            blockchain.addBlock(transaction);

            broadcastChain();
            saveTransactionLocal();
            saveChainLocal();

        }

        //ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature));
    }else{
        blockchain.addBlock(transaction);
        broadcastChain();
        saveTransactionLocal()
        saveChainLocal();
    }






    res.redirect('/chain');
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
    i=0;
    unconfirmedTransactions.forEach(transaction =>{
        console.log(i)
        console.log("Sender address: "+transaction.senderAddress)
        console.log("should be true: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify(transaction.id,transaction.signature));
        console.log("should be false: "+ec.keyFromPublic(transaction.senderAddress,'hex').verify("transaction.id",transaction.signature));
    });
    res.redirect('/');
});
app.post('/getMoney',(req,res)=>{
    //records.push(new Record("POST","/replaceChain",req.connection.remoteAddress.split(":")[3],req.body));
    //let address = req.body;

  //  console.log("ADDRESS: "+ JSON.stringify(req.body));

    const { address } = req.body;


    let total = 0;
   let money= getUnspentTransactions(address);
    money.forEach(transaction =>{
        transaction.txOuts.forEach(out=>{
            if(out.address == address)
            {

                total = parseInt(out.amount) + total;

            }
        });
    });
    console.log("denar: "+total)
    res.json(total);
});
app.post('/unspent-txIns',(req,res)=>{
    const { address } = req.body;
    //console.log("ADDRESS transaciton "+address )


    console.log("TRANSAKCIJE "+getUnspentTransactions(address))
    res.json(getUnspentTransactions(address));
});
