import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 32px',background:'#ff6b35',color:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.15)',position:'sticky',top:0,zIndex:100}}>
      <Link to="/menu" style={{fontSize:'22px',fontWeight:'bold',color:'#fff',textDecoration:'none'}}>🍕 FOOD APP Deliveryyyyy</Link>
      <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
        {user ? (
          <>
            <span style={{fontSize:'14px',opacity:0.9}}>Hi, {user.name} 👋</span>

            {/* Admin badge + link */}
            {user.role === 'admin' && (
              <Link to="/admin" style={{
                color:'#ff6b35', background:'#fff', textDecoration:'none',
                fontSize:'13px', fontWeight:'700', padding:'4px 12px',
                borderRadius:'20px', letterSpacing:'0.5px'
              }}>
                ⚙️ Admin
              </Link>
            )}

            <Link to="/menu" style={{color:'#fff',textDecoration:'none',fontSize:'15px'}}>Menu</Link>
            <Link to="/cart" style={{color:'#fff',textDecoration:'none',fontSize:'15px',position:'relative'}}>
              🛒 Cart
              {cartCount > 0 && (
                <span style={{position:'absolute',top:'-8px',right:'-10px',background:'#fff',color:'#ff6b35',
                  borderRadius:'50%',width:'18px',height:'18px',fontSize:'11px',
                  display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders" style={{color:'#fff',textDecoration:'none',fontSize:'15px'}}>My Orders</Link>
            <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.2)',color:'#fff',
              border:'1px solid rgba(255,255,255,0.5)',borderRadius:'6px',
              padding:'6px 14px',cursor:'pointer',fontSize:'14px'}}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{color:'#fff',textDecoration:'none',fontSize:'15px'}}>Login</Link>
            <Link to="/signup" style={{color:'#fff',textDecoration:'none',fontSize:'15px'}}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
