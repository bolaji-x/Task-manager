import { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <h1>Task Manager</h1>

      {!loggedIn && !showLogin && (
        <div className="auth-box">
          <Register />
          <p className="switch-text">
            Already have an account?{' '}
            <button className="link-btn" onClick={() => setShowLogin(true)}>Login</button>
          </p>
        </div>
      )}

      {!loggedIn && showLogin && (
        <div className="auth-box">
          <Login onLoginSuccess={() => setLoggedIn(true)} />
          <p className="switch-text">
            Need an account?{' '}
            <button className="link-btn" onClick={() => setShowLogin(false)}>Register</button>
          </p>
        </div>
      )}

      {loggedIn && <TaskList />}
    </div>
  );
}

export default App;