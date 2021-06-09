import Login from './components/Login';
import Register from './components/Register';
import Button from "./components/Button";
import {BrowserRouter, Link, Route} from 'react-router-dom';
import NewTransaction from "./components/NewTransaction";
import User from "./components/User";
import {useState} from 'react';


function App() {
  //[showUser, setShowUser] = useState(false);

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
            <User/>
            <Link className="btn btn-primary" to="/transaction">Nova tranzakcija</Link>
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
          <NewTransaction/>
        </Route>
        </div>
      </BrowserRouter>

  );
}

export default App;
