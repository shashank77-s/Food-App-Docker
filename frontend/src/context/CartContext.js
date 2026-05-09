import { createContext, useContext, useState } from 'react';
import API from '../api/axios';
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const fetchCart = async () => {
    try { const res = await API.get('/cart'); setCart(res.data); } catch (err) { console.error(err); }
  };
  const addToCart = async (foodId, quantity = 1) => {
    try { const res = await API.post('/cart', { foodId, quantity }); setCart(res.data.cart); } catch (err) { console.error(err); }
  };
  const removeFromCart = async (foodId) => {
    try { const res = await API.delete('/cart/' + foodId); setCart(res.data.cart); } catch (err) { console.error(err); }
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, clearCart, cartCount }}>{children}</CartContext.Provider>;
};
export const useCart = () => useContext(CartContext);
