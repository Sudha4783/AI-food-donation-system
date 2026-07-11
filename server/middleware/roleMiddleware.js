// Role-based access control middleware factory
// Usage: authorize('admin') or authorize('admin', 'ngo')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, please login first');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      const allowed = roles.join(', ');
      throw new Error(
        `Access denied. Required role(s): [${allowed}]. Your role: [${req.user.role}]`
      );
    }

    next();
  };
};
