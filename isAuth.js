const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'No autorizado' });
};

module.exports = isAuthenticated;
