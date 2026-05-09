const User = require('../models/User');

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.food');
    res.json(user.cart);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);
    const existing = user.cart.find(item => item.food.toString() === foodId);
    if (existing) existing.quantity += quantity;
    else user.cart.push({ food: foodId, quantity });
    await user.save();
    await user.populate('cart.food');
    res.json({ message: 'Added to cart!', cart: user.cart });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find(item => item.food.toString() === req.params.foodId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });
    item.quantity = quantity;
    await user.save();
    res.json({ message: 'Cart updated!', cart: user.cart });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.food.toString() !== req.params.foodId);
    await user.save();
    res.json({ message: 'Item removed!', cart: user.cart });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
