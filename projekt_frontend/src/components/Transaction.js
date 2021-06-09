function Transaction(props) {
    var myStyle = {
        width : 600,
    }


    return (
        <div style={myStyle} className="card text-dark mb-2">
                <h3>Transakcija</h3>
                <p><b>ID - </b></p>
                <p>{props.transaction.id}</p>
                <p><b>Signature - </b></p>
                <p>{props.transaction.signature}</p>
                <p><b>Sender address - </b></p>
                <p>{props.transaction.senderAddress}</p>
            <p><b>Sent To - </b></p>
            <p>{props.transaction.address}</p>
            <p><b>Amount - </b></p>
            <p>{props.transaction.amount}</p>
        </div>
    )
}

export default Transaction;