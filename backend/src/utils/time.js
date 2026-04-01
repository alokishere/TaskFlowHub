const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

const getLocalDateString = (date = new Date()) => (
  new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
);

const getLocalTimeString = (date = new Date()) => (
  new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
);

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes, seconds = '0'] = timeString.split(':');
  const hh = Number(hours);
  const mm = Number(minutes);
  const ss = Number(seconds);

  if ([hh, mm, ss].some((v) => Number.isNaN(v))) {
    return null;
  }

  return (hh * 60) + mm + (ss / 60);
};

const calculateWorkedMinutes = (punchIn, punchOut) => {
  const inMinutes = parseTimeToMinutes(punchIn);
  const outMinutes = parseTimeToMinutes(punchOut);

  if (inMinutes === null || outMinutes === null) {
    return 0;
  }

  let diff = outMinutes - inMinutes;
  if (diff < 0) {
    diff += 24 * 60;
  }

  return Math.max(0, Math.round(diff));
};

const formatWorkedDuration = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hrs = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hrs}h ${mins}m`;
};

module.exports = {
  APP_TIMEZONE,
  getLocalDateString,
  getLocalTimeString,
  calculateWorkedMinutes,
  formatWorkedDuration
};
