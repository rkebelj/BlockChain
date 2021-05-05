const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const path = require("path");
const querystring = require("qs");
var http = require('http');
let Record = require('../record');


// create a new blockchain instance
const blockchain = new Blockchain();

var peers = [];

const records = [];

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

//create a new app
const app  = express();


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

//using the blody parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());




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

//POST
app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    broadcastChain();
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


//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000;
// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})