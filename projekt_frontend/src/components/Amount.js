import { useState, useEffect } from 'react';

function Amount(props){

    const[amount, setAmount] = useState('');

    useEffect( function () {
        const getAmount = async function () {
            const res = await fetch('http://localhost:3001/users/amount',
                {
                    method: 'GET',
                    credentials:'include'
                });
            const data = await res.json();
            console.log("heejjjj" + data);
            setAmount(data.amount);
        }
        getAmount();
    }, []);

    return (
        <>
            <h3>Amount:</h3>
            <p>{amount}</p>
        </>
    )
}

export default Amount;