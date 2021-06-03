import { useState } from 'react';
import Button from "./Button";

function Transaction(props) {
    const[username, setUsername] = useState('');
    const[amount, setAmount] = useState('');

    async function Login(e){
        e.preventDefault();

        const res = await fetch('http://localhost:3001/users/transaction', {
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

        setUsername("");
        setAmount("");
    }

    return (
        <form className="form-group" onSubmit={Transaction}>
            <input type="text" className="form-control" name="username" placeholder="Uporabniško ime" value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
            <input type="text" className="form-control" name="amount" placeholder="Geslo" value={amount} onChange={(e)=>{setAmount(e.target.value)}}/>
            <Button text="Pošlji"/>
        </form>
    )
}

export default Transaction;