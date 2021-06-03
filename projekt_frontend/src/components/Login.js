import { useState } from 'react'
import Button from "./Button";
import {Link} from "react-router-dom";

function Login(props) {
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');

    async function Login(e){
        e.preventDefault();

        const res = await fetch('http://localhost:3001/users/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const data = await res.json();

        setUsername("");
        setPassword("");
    }

    return (
        <form className="form-group" onSubmit={Login}>
            <input type="text" className="form-control" name="username" placeholder="Uporabniško ime" value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
            <input type="password" className="form-control" name="password" placeholder="Geslo" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
            <Button text="Prijavi"/>
        </form>
    )
}

export default Login;