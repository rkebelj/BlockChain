import { useState, useEffect } from 'react';
import Button from "./Button";
import Transactions from "./Transactions";

function User(props) {
    const[username, setUsername] = useState('');
    const[publicKey, setPublicKey] = useState('');
    const[amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);

        useEffect( function () {
            const getUser = async function () {
                const res = await fetch('http://localhost:3001/users/user')
                const data = await res.json();
                setUsername(data.username);
                setPublicKey(data.publicKey);
                setAmount(data.amount);
            }
            getUser();
        }, []);

    useEffect(function () {
        const getTransactions = async function () {
            const res = await fetch('http://localhost:3001/users/transactions');
            const data = await res.json();
            setTransactions(data);
            //console.log(data);
        }
        getTransactions();
    }, []);

    return (
        <>
            <h1>Profil uporabnika</h1>
            <h2>Username:</h2>
            <p content={username}></p>
            <h2>Public Key:</h2>
            <p content={publicKey}></p>
            <h2>Stanje:</h2>
            <p content={amount}></p>
            <h2>Validirane transakcije:</h2>
            <Transactions transactions={transactions}/>
        </>
    )
}

export default User;