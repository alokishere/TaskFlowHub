const Attendance = require('../models/Attendance');

const punchIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const punchTime = new Date().toLocaleTimeString('en-GB'); // HH:MM:SS

    let attendance = await Attendance.findOne({ userId: req.user.id, date: today });

    if (attendance && attendance.punchIn) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: today,
        punchIn: punchTime,
        status: 'present'
      });
    } else {
      attendance.punchIn = punchTime;
      attendance.status = 'present';
    }

    await attendance.save();
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const punchOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const punchTime = new Date().toLocaleTimeString('en-GB');

    const attendance = await Attendance.findOne({ userId: req.user.id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You must punch in first' });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    attendance.punchOut = punchTime;
    await attendance.save();
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const history = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find().populate('userId', 'name email').sort({ date: -1 });
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  getAllAttendance
};
