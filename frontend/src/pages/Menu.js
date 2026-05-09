import { useState, useEffect } from 'react';
import API from '../api/axios';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';
const CATEGORIES = ['all', 'burger', 'pizza', 'drinks', 'dessert', 'sides'];
const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchCart } = useCart();
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await API.get('/foods');
        setFoods(res.data); setFiltered(res.data);
        fetchCart();
      } catch (err) { setError('Failed to load menu'); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);
  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setFiltered(cat === 'all' ? foods : foods.filter(f => f.category === cat));
  };
  if (loading) return <div style={{textAlign:'center',padding:'60px',fontSize:'18px'}}>Loading menu... 🍕</div>;
  if (error) return <div style={{textAlign:'center',padding:'60px',fontSize:'18px',color:'red'}}>{error}</div>;
  return (
    <div style={{maxWidth:'1100px',margin:'0 auto',padding:'32px 20px'}}>
      <h1 style={{fontSize:'28px',marginBottom:'20px'}}>Our Menu</h1>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap'}}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategory(cat)} style={{padding:'8px 20px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:600,background:activeCategory===cat?'#ff6b35':'#f0f0f0',color:activeCategory===cat?'#fff':'#555',transition:'all 0.2s'}}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0
        ? <p style={{textAlign:'center',padding:'60px',color:'#888'}}>No items in this category</p>
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'24px'}}>
            {filtered.map(food => <FoodCard key={food._id} food={food} />)}
          </div>
      }
    </div>
  );
};
export default Menu;
