const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.name === 'ValidationError')
    message = Object.values(err.errors).map(e => e.message).join(', ');
  if (err.code === 11000)
    message = Object.keys(err.keyValue)[0] + ' already exists';
  if (err.name === 'JsonWebTokenError')
    message = 'Invalid token';
  logger.error(req.method + ' ' + req.path + ' -> ' + status + ': ' + message);
  res.status(status).json({ success: false, message });
};
