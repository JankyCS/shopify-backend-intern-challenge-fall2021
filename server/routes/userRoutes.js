const express = require('express')
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const router = express.Router()
const bcrypt = require("bcryptjs");

router.post("/register", (req, res) => {
    // Check validation
    if (req.body.username == null || req.body.password == null) {
      return res.status(400).json({ error: "missing username or pass" });
    }

    User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      return res.status(400).json({ email: "User already exists" });
    }
    else {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
            });
        });
    }
  });
});

router.post("/login", (req, res) => {
    // Form validation
    if (req.body.username == null || req.body.password == null) {
      return res.status(400).json({ error: "missing username or pass" });
    }
    const username = req.body.username;
    const password = req.body.password;
    // Find user by email
    User.findOne({ username }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };
        // Sign token
        jwt.sign(
            payload,
            "secret",
            {
                expiresIn: 604800 // 1 Week in seconds
            },
            (err, token) => {
                res.json({
                    success: true,
                    token: token
                });
            }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;