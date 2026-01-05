var express = require('express');
var router = express.Router();
var { db } = require('../config/firebase');

// POST create a new user.
router.post('/', async function (req, res, next) {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).send("Name and Email are required");
        }
        const newUserRef = db.collection('users').doc();
        await newUserRef.set({ name, email });
        res.status(201).json({ id: newUserRef.id, name, email });
    } catch (error) {
        console.error("Error creating user: ", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/login", (req, res)=>{
    res.json(req.body)
})

module.exports = router;