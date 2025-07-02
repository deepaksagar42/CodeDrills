module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // attach user info to the request
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
};