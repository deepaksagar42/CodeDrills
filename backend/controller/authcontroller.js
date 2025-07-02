const User = require("../models/user");
const bcrypt = require("bcrypt");
// Signup controller
exports.signup = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }
     const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ email, username,  password: hashedPassword });
    await newUser.save();

    // ✅ Include both email and username in session
    req.session.user = {
      email: newUser.email,
      username: newUser.username,
    };

    res.status(201).json({
      message: "User registered successfully",
      username: newUser.username,
      email: newUser.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Include both email and username in session
    req.session.user = {
      email: user.email,
      username: user.username,
    };

    res.json({
      message: "Login successful",
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Logout controller
exports.logout = (req, res) =>
   {
  req.session.destroy(() => 
    {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
    });
};

// Auth check controller
exports.getUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ username: req.session.user.username });
};

