var EC = require('elliptic').ec;
// we use the same preset of bitcoin, but should work with the other ones too
var ec = new EC('secp256k1');


const SHA256 = require('crypto-js/sha256');
const fs = require("fs");
const privateKeyLocation = 'savedJSON/private_key.json';


class KeyPair{
    static getPair(){
         return  ec.genKeyPair();
    }
    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }
    /**
     * verify the transaction signature to
     * check its validity using the method provided
     * in EC module
     */

    static verifySignature(publicKey,signature,dataHash){
        return ec.keyFromPublic(publicKey,'hex').verify(dataHash,signature);
    }


}

module.exports = KeyPair;