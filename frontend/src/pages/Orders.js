import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
const STATUS_COLORS = {
  pending:{bg:'#fff8e1',color:'#f59e0b'},
  confirmed:{bg:'#e8f5e9',color:'#22c55e'},
  preparing:{bg:'#e3f2fd',color:'#3b82f6'},
  delivered:{bg:'#f0fdf4',color:'#16a34a'},
  cancelled:{bg:'#fef2f2',color:'#ef4444'},
};
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { fetchOrders(); }, []);
  const fetchOrders = async () => {
    try { const res = await API.get('/orders/my'); setOrders(res.data); }
    catch (err) { setError('Failed to load orders'); }
    finally { setLoading(false); }
  };
  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await API.put('/orders/' + orderId + '/cancel');
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) { alert(err.response?.data?.message || 'Could not cancel order'); }
    finally { setCancelling(null); }
  };
  if (loading) return <div style={{textAlign:'center',padding:'60px',fontSize:'18px'}}>Loading orders...</div>;
  if (error) return <div style={{textAlign:'center',padding:'60px',fontSize:'18px',color:'red'}}>{error}</div>;
  if (orders.length === 0) return (
    <div style={{textAlign:'center',padding:'80px 20px'}}>
      <p style={{fontSize:'20px'}}>No orders yet 📦</p>
      <button onClick={() => navigate('/menu')} style={{marginTop:'16px',padding:'12px 28px',background:'#ff6b35',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'15px'}}>Order Food Now</button>
    </div>
  );
  return (
    <div style={{maxWidth:'800px',margin:'0 auto',padding:'32px 20px'}}>
      <h1 style={{fontSize:'28px',marginBottom:'28px'}}>My Orders 📦</h1>
      <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
        {orders.map(order => {
          const sc = STATUS_COLORS[order.status] || {};
          return (
            <div key={order._id} style={{background:'#fff',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.07)',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'20px 20px 14px',borderBottom:'1px solid #f0f0f0'}}>
                <div>
                  <p style={{margin:'0 0 4px',fontWeight:700,fontSize:'15px'}}>Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p style={{margin:0,fontSize:'13px',color:'#999'}}>{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                <span style={{padding:'5px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:600,background:sc.bg,color:sc.color}}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div style={{padding:'14px 20px',borderBottom:'1px solid #f0f0f0'}}>
                {order.items.map((item, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',paddingBottom:'8px'}}>
                    <span style={{flex:1,fontSize:'14px'}}>{item.name}</span>
                    <span style={{fontSize:'13px',color:'#999',width:'36px'}}>× {item.quantity}</span>
                    <span style={{fontSize:'14px',fontWeight:600,color:'#333',width:'70px',textAlign:'right'}}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',padding:'14px 20px'}}>
                <div>
                  <p style={{margin:'0 0 4px',fontSize:'13px',color:'#777'}}>📍 {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.zip}</p>
                  <p style={{margin:0,fontSize:'13px',color:'#777'}}>💳 {order.paymentMethod.toUpperCase()}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{margin:'0 0 10px',fontSize:'16px'}}>Total: <strong>₹{order.totalAmount.toFixed(2)}</strong></p>
                  {order.status === 'pending' && (
                    <button onClick={() => handleCancel(order._id)} disabled={cancelling === order._id} style={{padding:'7px 16px',background:'#fff',color:'#ef4444',border:'1px solid #ef4444',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600}}>
                      {cancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Orders;
