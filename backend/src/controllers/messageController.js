const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    
    // Check receiver and roles
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // Restriction: Employee can only message admin
    if (req.user.role === 'employee' && receiver.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Employees are only allowed to message administrators.' 
      });
    }

    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      message
    });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params; // The other user in the conversation
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as seen
    await Message.updateMany(
      { senderId: userId, receiverId: req.user.id, seen: false },
      { seen: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation
};
