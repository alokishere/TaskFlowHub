const Attendance = require('../models/Attendance');
const {
  getLocalDateString,
  getLocalTimeString,
  calculateWorkedMinutes,
  formatWorkedDuration
} = require('../utils/time');

const serializeAttendance = (entry) => {
  const data = entry.toObject ? entry.toObject() : entry;
  const today = getLocalDateString();
  const isToday = data.date === today;
  const hasCompletedShift = Boolean(data.punchIn && data.punchOut);

  let workedMinutes = Number(data.workedMinutes) || 0;

  if (hasCompletedShift && workedMinutes === 0) {
    workedMinutes = calculateWorkedMinutes(data.punchIn, data.punchOut);
  }

  if (!hasCompletedShift && isToday && data.punchIn) {
    workedMinutes = calculateWorkedMinutes(data.punchIn, getLocalTimeString());
  }

  return {
    ...data,
    workedMinutes,
    workedDuration: formatWorkedDuration(workedMinutes)
  };
};

const punchIn = async (req, res, next) => {
  try {
    const today = getLocalDateString();
    const punchTime = getLocalTimeString();

    let attendance = await Attendance.findOne({ userId: req.user.id, date: today });

    if (attendance && attendance.punchIn) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: today,
        punchIn: punchTime,
        status: 'present',
        workedMinutes: 0
      });
    } else {
      attendance.punchIn = punchTime;
      attendance.punchOut = null;
      attendance.status = 'present';
      attendance.workedMinutes = 0;
    }

    await attendance.save();
    res.status(200).json({ success: true, data: serializeAttendance(attendance) });
  } catch (error) {
    next(error);
  }
};

const punchOut = async (req, res, next) => {
  try {
    const today = getLocalDateString();
    const punchTime = getLocalTimeString();

    const attendance = await Attendance.findOne({ userId: req.user.id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You must punch in first' });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    attendance.punchOut = punchTime;
    attendance.workedMinutes = calculateWorkedMinutes(attendance.punchIn, punchTime);
    await attendance.save();
    res.status(200).json({ success: true, data: serializeAttendance(attendance) });
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const history = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: history.map(serializeAttendance) });
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find().populate('userId', 'name email').sort({ date: -1 });
    res.status(200).json({ success: true, data: attendance.map(serializeAttendance) });
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
