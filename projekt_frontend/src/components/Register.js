import { useState } from 'react'
import Button from "./Button";

function Register(props) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function Register(e) {
        e.preventDefault();

        const res = await fetch('http://localhost:3001/users/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });

        const data = await res.json();

        setEmail("");
        setPassword("");
        setUsername("");
    }

        return (
            <form className="form-group" onSubmit={Register}>
                <input type="text" className="form-control" name="email" placeholder="Mail" value={email}
                       onChange={(e) => {
                           setEmail(e.target.value)
                       }}/>
                <input type="text" className="form-control" name="username" placeholder="Uporabniško ime"
                       value={username} onChange={(e) => {
                    setUsername(e.target.value)
                }}/>
                <input type="password" className="form-control" name="password" placeholder="Geslo" value={password}
                       onChange={(e) => {
                           setPassword(e.target.value)
                       }}/>
                <Button text="Registriraj"/>
            </form>
        )
}
    export default Register;
