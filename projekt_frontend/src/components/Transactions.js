import Transaction from "./Transaction";
import {Link} from "react-router-dom";

function Transactions(props) {
    var data = Array.from(props.transactions);
    return (
        <div>

            {data.map((transaction) => (
                <>
                    <Transaction key={transaction._id} transaction={transaction}/>
                </>
            ))}
        </div>
    )
}

export default Transactions;
