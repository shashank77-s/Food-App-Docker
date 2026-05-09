const Order = require('../models/Order');
const User = require('../models/User');

const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    const user = await User.findById(req.user._id).populate('cart.food');
    if (user.cart.length === 0)
      return res.status(400).json({ message: 'Your cart is empty' });

    const items = user.cart.map(item => ({
      food: item.food._id,
      name: item.food.name,
      price: item.food.price,
      quantity: item.quantity,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ user: req.user._id, items, totalAmount, deliveryAddress, paymentMethod });
    user.cart = [];
    await user.save();
    res.status(201).json({ message: 'Order placed! 🎉', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (order.status !== 'pending')
      return res.status(400).json({ message: `Cannot cancel — order is already ${order.status}` });
    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ message: 'Status updated!', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus, getAllOrders };
