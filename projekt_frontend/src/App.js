import {useState, useEffect} from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Transaction from './components/Transactions';
import Button from "./components/Button";
import {BrowserRouter, Link, Route} from 'react-router-dom';

function App() {

  async function logout() {
    await fetch('http://localhost:3001/users/logout', {
      method: 'GET',
      credentials: 'include'
    });
  }

  return (
      <BrowserRouter>
        <div className='container'>

          <Route path='/' exact>
            <Link to="/register" className="btn btn-primary">Registracija</Link>
            <Link to="/login" className="btn btn-primary">Vpis</Link>

            <Button onClick={logout} text="Odjava"/>
            <Link to="/transaction" className="btn btn-primary">Transakcije</Link>
          </Route>
          <Route path='/register'>
            <Link to="/" className="btn btn-primary">Nazaj</Link>
            <Register/>
          </Route>
          <Route path='/login'>
            <Link to="/" className="btn btn-primary">Nazaj</Link>
            <Login/>
          </Route>
          <Route path='/transaction'>
            <Link to="/" className="btn btn-primary">Nazaj</Link>
            <Transaction/>
          </Route>
        </div>
      </BrowserRouter>

  );
}

export default App;
