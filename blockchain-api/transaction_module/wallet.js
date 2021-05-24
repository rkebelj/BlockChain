const { INITIAL_BALANCE } = require('../config');
//const Transaction = require('./transaction');
var EC = require('elliptic').ec;
// we use the same preset of bitcoin, but should work with the other ones too
var ec = new EC('secp256k1');
const {TxIn} = require('../transaction_module/transaction');
const {TxOut} = require('../transaction_module/transaction');
const {Transaction} = require('../transaction_module/transaction');


const fs = require("fs");



const SHA256 = require('crypto-js/sha256');
const KeyPair = require("../keyPair");

class Wallet{
    /**
     * the wallet will hold the public key
     * and the private key pair
     * and the balance
     */
    constructor(){
        //this.balance = INITIAL_BALANCE;
        this.keyPair = KeyPair.generateKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex',false);
        this.unspent = [];
    }
    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }


    toString(){
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}`
    }




    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }


    static verifySignature(publicKey,signature,dataHash){
        return ec.keyFromPublic(publicKey,'hex').verify(dataHash,signature);
    }

    /**
     * combines the functionality to create a new transaction
     * update a transaction into one and also update the transaction
     * pool if the transaction exists already.
     */

     toHexString(byteArray)  {

        return Array.from(byteArray, (byte) => {

            return ('0' + (byte & 0xFF).toString(16)).slice(-2);

        }).join('');

    };
     createTransaction(unspentTxIns,address,amount){
         console.log("Unspent TRANSACTIONS"+JSON.stringify(unspentTxIns))
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




}
module.exports = Wallet;