const crypto= require("crypto");
class TxOut{
    constructor(address,amount) {
        this.amount=amount;
        this.address=address;
    }
}

class TxIn{
    constructor(id,index) {
        this.transactionId=id;
        this.txOutIndex=index;
    }
}
class Transaction {
    constructor(){
        this.id;
        this.txOuts=[];
        this.txIns=[];
        this.signature="";
        this.senderAddress="";
    }

     setTransactionId(){
        let txInStr="";
        let txOutStr="";
        this.txIns.forEach(i => {
            txInStr +=i.transactionId+i.txOutIndex;
        });
         this.txOuts.forEach(o => {
             txOutStr +=o.transactionId+o.txOutIndex;
        });
         console.log(txInStr+" txIn "+txOutStr+"txOut "+this.senderAddress);
        const mergedString=txInStr+txOutStr+this.senderAddress;
        this.id = crypto.createHash("sha256").update(mergedString).digest("hex");
    }




}
module.exports = {

   Transaction,TxIn,TxOut
}