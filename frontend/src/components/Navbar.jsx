import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>Geobucket CBT</h1>
      </div>
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Hello, {user.name}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-outline btn-sm">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
