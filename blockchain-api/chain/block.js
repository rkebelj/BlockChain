const SHA256 = require('crypto-js/sha256');
class Block{


    constructor(timestamp,lastHash,hash,data,index){
        this.index=index;
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    toString(){
        return `Block - 
        Index     : ${this.index}
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash}
        Hash      : ${this.hash}
        Data      : ${this.data}`;
    }

    static firstBlock(){
        return new this('first block','----','firstBlock-hash',
            {

                    id: "",
                    signature: "",
                    txIns: [],
                    txOuts: [],
                    senderAddress: ""
                }
            ,0);
    }

    static hash(timestamp,lastHash,data){
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    static mineBlock(lastBlock,data){

        let hash;
        let timestamp = new Date();
        console.log(timestamp.getUTCDate());
        const lastHash = lastBlock.hash;
        hash = Block.hash(timestamp,lastHash,data);

        return new this(timestamp,lastHash,hash,data,lastBlock.index+1);
    }

    static blockHash(block){

        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp,lastHash,data);
    }
}

module.exports = Block;