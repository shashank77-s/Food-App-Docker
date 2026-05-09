const Food = require('../models/Food');

const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({ isAvailable: true });
    res.json(foods);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json(food);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getFoodsByCategory = async (req, res) => {
  try {
    const foods = await Food.find({ category: req.params.category, isAvailable: true });
    res.json(foods);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ message: 'Food item added!', food });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json({ message: 'Food updated!', food });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json({ message: 'Food item deleted!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllFoods, getFoodById, getFoodsByCategory, addFood, updateFood, deleteFood };
