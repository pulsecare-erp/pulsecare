var express = require('express');
var router = express.Router();
var { db } = require('../config/firebase');

// GET users listing.
router.get('/', async function (req, res, next) {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error getting users: ", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;