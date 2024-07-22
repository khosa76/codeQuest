const express = require("express");
const router = express.Router();
const GeneralQuestion = require("../models/generalQuestion");

router.get("/get-questions", async (req, res) => {
    try {
        const questions = await GeneralQuestion.find();
        res.json(questions);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post("/add-question", async (req, res) => {
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

module.exports = router;
