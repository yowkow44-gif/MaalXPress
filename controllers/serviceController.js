const ServiceOrder = require('../models/ServiceOrder');
const User = require('../models/User');

exports.grabService = async (req,res) => {
  const { serviceName, amount } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);
  if(user.totalBalance < amount) return res.status(400).json({msg:'insufficient'});
  user.totalBalance -= amount; // reserve
  await user.save();
  const order = await ServiceOrder.create({ user:user, serviceName, amount, status:'queued' });
  res.json({ msg:'grabbed', orderId: order._id });
};

exports.submitService = async (req,res) => {
  const { orderId } = req.params;
  const order = await ServiceOrder.findById(orderId);
  if(!order) return res.status(404).json({msg:'not found'});
  order.status = 'done';
  await order.save();
  res.json({ msg:'submitted' });
};
