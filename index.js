// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs"); // Make sure to install bcryptjs using npm

// Initialize the Express application
const app = express();

// Connect to MongoDB
mongoose
    .connect(
        "mongodb+srv://jabardastsingh60:Singh55.@codequest.vgazocj.mongodb.net/codeQuest",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const User = require("./models/user");
const GeneralQuestion = require("./models/generalQuestion");
const GameRecord = require('./models/generalQuestionScoreSave'); // Adjust the path as needed



// Set view engine and static files directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/public/assets", express.static("./public/assets"));

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/stuLogin", (req, res) => {
    res.render("layout/stuLogin");
});

app.get("/parentLogin", (req, res) => {
    res.render("layout/parentLogin");
});

app.get("/general-questions", async (req, res) => {
    try {
        const questions = await GeneralQuestion.find();
        res.json(questions);
    } catch (error) {
        res.status(500).send(error);
    }
});


// to get the questions form DB to App

app.get("/api/get-questions", async (req, res) => {
    try {
        const questions = await GeneralQuestion.find();
        res.json(questions);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to add a new question of GK to Database add in json format  through postman 
// post http://localhost:9091/api/add-question

app.post("/api/add-question", async (req, res) => {
    const { question, A, B, C, D, answer } = req.body;

    if (!question || !A || !B || !C || !D || !answer) {
        return res.status(400).send("All fields are required.");
    }

    const newQuestion = new GeneralQuestion({ question, A, B, C, D, answer });

    try {
        await newQuestion.save();
        res.status(201).send("Question added successfully");
    } catch (error) {
        res.status(500).send(error);
    }
});



app.post("/signup", async (req, res) => {
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

app.post("/parentLogin", async (req, res) => {
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

app.get("/stuDashboard", (req, res) => {
    res.render("layout/stuDashboard");
});

// app.post("/stuLogin", async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.status(400).send("Email and password are required");
//     }
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send("User not found");
//         }

//         // Compare hashed password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).send("Invalid credentials");
//         }


//         res.redirect("/stuDashboard");
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).send("Login error");
//     }
// });




app.post("/stuLogin", async (req, res) => {
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













app.get("/maths", (req, res) => {
    console.log("Rendering maths page");
    res.render("maths");
});

app.get("/rational", (req, res) => {
    res.render("rational");
});

app.get("/general", (req, res) => {
    res.render("general");
});

app.get("/game", (req, res) => {
    res.render("generalKnowledgeGame/game");
});

// Route for the end game page
app.get("/end", (req, res) => {
    res.render("generalKnowledgeGame/end");
});
app.get("/landingPage", (req, res) => {
    res.render("landingPage");
});

const port = 9091;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});


// endpoint for score saving

// Score model

// const Score = require('./models/generalQuestionScoreSave');


app.post('/api/save-score', async (req, res) => {
    const { userId, score, email } = req.body;

    if (!userId || score === undefined) {
        return res.status(400).json({ error: 'User ID and score are required.' });
    }

    try {
        // Save the score in the GameRecord collection
        const gameRecord = new GameRecord({
            userId,
            email, // Include email if it's part of the request
            score
        });
        await gameRecord.save();

        // Update the user's high score
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }

        res.status(201).json({ message: 'Score saved successfully' });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: `Error saving score: ${error.message}` });
    }
});


app.post("/api/stuLogin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
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
        res.status(500).json({ error: "Login error" });
    }
});

