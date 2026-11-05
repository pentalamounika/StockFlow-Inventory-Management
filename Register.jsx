
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.post('/auth/register', {
                name,
                email,
                password
            });

            alert('Registration successful! Please login.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>StockFlow</h1>
                <p className="auth-subtitle">Create your account</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleRegister}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />

                    <button type="submit">Create Account</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
