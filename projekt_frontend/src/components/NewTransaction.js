import {useState} from "react";
import Button from "./Button";

function NewTransaction(props) {
    const[username, setUsername] = useState('');
    const[amount, setAmount] = useState('');

    async function NewTransaction(e){
        e.preventDefault();

        const res = await fetch('http://localhost:3001/users/new_transaction', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                amount: amount
            })
        });
        const data = await res.json();
    }

    return (
        <form className="form-group" onSubmit={NewTransaction}>
            <input type="text" className="form-control" name="username" placeholder="Uporabniško ime" value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
            <input type="number" className="form-control" name="text" placeholder="Znesek" value={amount} onChange={(e)=>{setAmount(e.target.value)}}/>
            <Button text="Naloži"/>
        </form>
    )
}

export default NewTransaction;