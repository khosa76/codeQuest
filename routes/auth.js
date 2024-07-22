const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

router.post("/signup", async (req, res) => {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).send("Email already in use");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();
        res.render("registrationSuccess"); // Render the success page instead of sending text
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send("Error registering user");
    }
});

router.post("/stuLogin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                highScore: user.highScore
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Login error" });
    }
});

router.post("/parentLogin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid credentials");
        }
        // Here, implement session or token generation
        res.render("parentDashboard");
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Login error");
    }
});

module.exports = router;
