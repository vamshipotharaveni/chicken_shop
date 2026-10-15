function verifyAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = verifyAdmin;
