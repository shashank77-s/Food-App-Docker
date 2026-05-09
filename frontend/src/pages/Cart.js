import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
const Cart = () => {
  const { cart, fetchCart, removeFromCart, clearCart } = useCart();
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => { fetchCart(); }, []);
  const total = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });
  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.zip) return setMessage('Please fill in your delivery address');
    setPlacing(true);
    try {
      await API.post('/orders', { deliveryAddress: address, paymentMethod });
      clearCart(); setMessage('Order placed! 🎉');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) { setMessage(err.response?.data?.message || 'Failed to place order'); }
    finally { setPlacing(false); }
  };
  if (cart.length === 0) return (
    <div style={{textAlign:'center',padding:'80px 20px',fontSize:'20px'}}>
      <p>Your cart is empty 🛒</p>
      <button onClick={() => navigate('/menu')} style={{marginTop:'16px',padding:'12px 28px',background:'#ff6b35',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'15px'}}>Browse Menu</button>
    </div>
  );
  const inputStyle = {display:'block',width:'100%',padding:'10px',marginBottom:'12px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'};
  return (
    <div style={{maxWidth:'1000px',margin:'0 auto',padding:'32px 20px'}}>
      <h1 style={{fontSize:'28px',marginBottom:'24px'}}>Your Cart 🛒</h1>
      {message && <p style={{background:'#fff3ee',color:'#ff6b35',padding:'12px',borderRadius:'8px',marginBottom:'20px'}}>{message}</p>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'32px'}}>
        <div>
          {cart.map(item => (
            <div key={item.food._id} style={{display:'flex',alignItems:'center',gap:'16px',background:'#fff',padding:'16px',borderRadius:'10px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',marginBottom:'16px'}}>
              <img src={item.food.image || 'https://via.placeholder.com/80'} alt={item.food.name} style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px'}} />
              <div style={{flex:1}}>
                <h4 style={{margin:'0 0 4px'}}>{item.food.name}</h4>
                <p style={{margin:0,color:'#888',fontSize:'14px'}}>₹{item.food.price} × {item.quantity} = <strong>₹{item.food.price * item.quantity}</strong></p>
              </div>
              <button onClick={() => removeFromCart(item.food._id)} style={{background:'none',border:'1px solid #ddd',borderRadius:'50%',width:'30px',height:'30px',cursor:'pointer',color:'#999',fontSize:'14px'}}>✕</button>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderTop:'2px solid #f0f0f0'}}>
            <span>Total</span>
            <strong style={{fontSize:'22px',color:'#ff6b35'}}>₹{total.toFixed(2)}</strong>
          </div>
        </div>
        <div style={{background:'#fff',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',alignSelf:'start'}}>
          <h3 style={{marginTop:0}}>Delivery Address</h3>
          <input style={inputStyle} name="street" placeholder="Street" value={address.street} onChange={handleAddressChange} />
          <input style={inputStyle} name="city" placeholder="City" value={address.city} onChange={handleAddressChange} />
          <input style={inputStyle} name="zip" placeholder="ZIP Code" value={address.zip} onChange={handleAddressChange} />
          <h3>Payment Method</h3>
          <div style={{display:'flex',gap:'16px',marginBottom:'20px'}}>
            {['cash','card','upi'].map(method => (
              <label key={method} style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'14px'}}>
                <input type="radio" name="payment" value={method} checked={paymentMethod===method} onChange={() => setPaymentMethod(method)} />
                {method.toUpperCase()}
              </label>
            ))}
          </div>
          <button onClick={handlePlaceOrder} disabled={placing} style={{width:'100%',padding:'14px',background:'#ff6b35',color:'#fff',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
            {placing ? 'Placing Order...' : 'Place Order · ₹' + total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Cart;
