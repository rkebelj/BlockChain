class Record {


    constructor(requestType,api,client,data) {

        this.timestamp = new Date();
        this.requestType = requestType;
        this.api = api;
        this.client = client;
        this.data = data;
    }

    toString() {
        return `  
        Request   : ${this.requestType}
        Api call  : ${this.api}
        Timestamp : ${this.timestamp}
        Client    : ${this.client}
        Data      : ${this.data}
        ------------------------------`;
    }

}
    module.exports = Record;