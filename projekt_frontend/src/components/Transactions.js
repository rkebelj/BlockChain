import Transaction from "./Transaction";
import {Link} from "react-router-dom";

function Transactions(props) {
    var data = Array.from(props.transactions);
    return (
        <>
            {data.map((transaction) => (
                <>
                    <Transaction key={transaction._id} transaction={transaction}/>
                </>
            ))}
        </>
    )
}

export default Transactions;
