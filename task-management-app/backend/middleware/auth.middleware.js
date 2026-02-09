const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { errorResponse } = require('../utils/response');

const auth = (req, res, next) => {
  (async () => {
    try {
      const authHeader = req.header('Authorization');

      if (!authHeader) {
        return errorResponse(res, 401, 'Authentication required');
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return errorResponse(res, 401, 'Authentication token is missing');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) {
        return errorResponse(res, 401, 'User not found');
      }
      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }
  })();
};



module.exports = { auth };
