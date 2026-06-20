const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const { httpError } = require('../utils/httpError');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'Authentication token is required');
  }

  const tokenHash = User.hashToken(token);
  const user = await User.findOne({
    'tokens.tokenHash': tokenHash,
    'tokens.expiresAt': { $gt: new Date() }
  }).select('+tokens');

  if (!user) {
    throw httpError(401, 'Invalid or expired authentication token');
  }

  req.user = user;
  req.tokenHash = tokenHash;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(httpError(401, 'Authentication token is required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(httpError(403, 'You do not have permission to perform this action'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};
