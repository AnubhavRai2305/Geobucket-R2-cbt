import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext';

function StudentRegister() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, rollNumber, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="panel-container" style={{ maxWidth: '450px', margin: '40px auto', padding: '32px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>Student Registration</h2>
            {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Roll Number</label>
                    <input 
                        type="text" 
                        value={rollNumber} 
                        onChange={(e) => setRollNumber(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Register</button>
            </form>
            <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
            </p>
        </div>
    );
}

export default StudentRegister;
