import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
const S = {container:{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f5f5f5'},card:{background:'#fff',padding:'40px',borderRadius:'12px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'},title:{textAlign:'center',marginBottom:'24px',fontSize:'24px'},input:{display:'block',width:'100%',padding:'12px',marginBottom:'16px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'15px',boxSizing:'border-box'},button:{width:'100%',padding:'12px',background:'#ff6b35',color:'#fff',border:'none',borderRadius:'8px',fontSize:'16px',cursor:'pointer',fontWeight:'bold'},error:{color:'red',marginBottom:'12px',background:'#fff0f0',padding:'10px',borderRadius:'6px'},link:{textAlign:'center',marginTop:'16px',fontSize:'14px'}};
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/menu');
    } catch (err) { setError(err.response?.data?.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };
  return (
    <div style={S.container}>
      <div style={S.card}>
        <h2 style={S.title}>Welcome Back 👋</h2>
        {error && <p style={S.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={S.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={S.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button style={S.button} type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p style={S.link}>New here? <Link to="/signup">Create account</Link></p>
      </div>
    </div>
  );
};
export default Login;
