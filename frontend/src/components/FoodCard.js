import { useCart } from '../context/CartContext';
import { useState } from 'react';
const FoodCard = ({ food }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const handleAdd = async () => {
    setAdding(true);
    await addToCart(food._id, 1);
    setAdding(false); setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  return (
    <div style={{background:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      <img src={food.image || 'https://via.placeholder.com/300x180?text=🍕+Food'} alt={food.name} style={{width:'100%',height:'180px',objectFit:'cover'}} />
      <div style={{padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <h3 style={{margin:0,fontSize:'17px',fontWeight:600}}>{food.name}</h3>
          <span style={{fontSize:'11px',background:'#fff3ee',color:'#ff6b35',padding:'3px 8px',borderRadius:'20px',textTransform:'capitalize'}}>{food.category}</span>
        </div>
        <p style={{fontSize:'13px',color:'#888',margin:'0 0 14px',lineHeight:1.5}}>{food.description}</p>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'20px',fontWeight:'bold',color:'#ff6b35'}}>₹{food.price}</span>
          <button onClick={handleAdd} disabled={adding} style={{padding:'8px 18px',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:600,background:added?'#4caf50':'#ff6b35',transition:'background 0.3s'}}>
            {adding ? 'Adding...' : added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default FoodCard;
