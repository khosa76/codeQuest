const express = require("express");
const router = express.Router();

router.get("/game", (req, res) => {
    res.render("generalKnowledgeGame/game");
});

router.get("/end", (req, res) => {
    res.render("generalKnowledgeGame/end");
});

router.post("/save-score", async (req, res) => {
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

module.exports = router;
