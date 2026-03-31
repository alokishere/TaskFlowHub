const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate value' });
  }

  return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
