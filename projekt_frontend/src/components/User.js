import { useState, useEffect } from 'react';
import Button from "./Button";
import Transactions from "./Transactions";
import Amount from "./Amount";

function User(props) {
    const[username, setUsername] = useState('');
    const[publicKey, setPublicKey] = useState('');
    const [transactions, setTransactions] = useState([]);

        useEffect( function () {
            const getUser = async function () {
                const res = await fetch('http://localhost:3001/users/user',
                {
                    method: 'GET',
                    credentials:'include'
                });
                const data = await res.json();
                setUsername(data.username);
                setPublicKey(data.public_key);
            }
            getUser();
        }, []);

    useEffect(function () {
        const getTransactions = async function () {
            const res = await fetch('http://localhost:3001/users/transactions',
                {
                    method: 'GET',
                    credentials:'include'
                });
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
            <p>{username}</p>
            <h2>Public Key:</h2>
            <p>{publicKey}</p>
            <Amount/>
            <h2>Validirane transakcije:</h2>
            <Transactions transactions={transactions}/>
        </>
    )
}

export default User;