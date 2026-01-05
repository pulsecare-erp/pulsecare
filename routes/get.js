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

// Login route
router.get("/login", (req, res)=>{
    res.render("pages/login")
})

// Patient flow route
router.get("/patientflow", (req, res)=>{
    res.render("pages/patientflow")
})

// Patient Dashboard route
router.get("/patient", (req, res)=>{
    res.render("pages/patient")
})

// Patient New Registre route
router.get("/newpatient", (req, res)=>{
    res.render("pages/newpatient")
})

// Staff route
router.get("/staff", (req, res)=>{
    res.render("pages/staff")
})
// Admin Operations route
router.get("/operations", (req, res)=>{
    res.render("pages/operations")
})

module.exports = router;