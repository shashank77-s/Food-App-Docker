import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const S = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f5f5f5' },
  card: { background:'#fff', padding:'40px', borderRadius:'12px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign:'center', marginBottom:'24px', fontSize:'24px' },
  input: { display:'block', width:'100%', padding:'12px', marginBottom:'16px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'15px', boxSizing:'border-box', background:'#fff', color:'#333' },
  button: { width:'100%', padding:'12px', background:'#ff6b35', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', fontWeight:'bold' },
  error: { color:'red', marginBottom:'12px', background:'#fff0f0', padding:'10px', borderRadius:'6px' },
  link: { textAlign:'center', marginTop:'16px', fontSize:'14px' },
  hint: { fontSize:'12px', color:'#999', marginTop:'-10px', marginBottom:'16px', paddingLeft:'4px' },
};

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.container}>
      <div style={S.card}>
        <h2 style={S.title}>Create Account 🍕</h2>

        {error && <p style={S.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input style={S.input} type="text" name="name"
            placeholder="Full Name" value={form.name}
            onChange={handleChange} required />

          <input style={S.input} type="email" name="email"
            placeholder="Email" value={form.email}
            onChange={handleChange} required />

          <input style={S.input} type="password" name="password"
            placeholder="Password (min 6 chars)" value={form.password}
            onChange={handleChange} required />

          {/* Role selector */}
          <select
            style={{ ...S.input, cursor:'pointer',
              color: form.role === 'admin' ? '#ff6b35' : '#333',
              fontWeight: form.role === 'admin' ? '600' : 'normal' }}
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">👤 Customer — Browse & order food</option>
            <option value="admin">⚙️ Admin — Manage menu & orders</option>
          </select>

          {/* Admin code field — only shows when admin is selected */}
          {form.role === 'admin' && (
            <>
              <input
                style={{ ...S.input, borderColor: '#ff6b35' }}
                type="password"
                name="adminCode"
                placeholder="Enter admin secret code"
                value={form.adminCode}
                onChange={handleChange}
                required
              />
              <p style={S.hint}>
                🔐 Admin accounts require a secret code. Contact the app owner to get it.
              </p>
            </>
          )}

          <button style={S.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={S.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;