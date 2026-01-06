var express = require('express');
var router = express.Router();
var { db } = require('../config/firebase');
var { isAuthenticated, hasRole } = require('../middleware/auth');

// GET Landing Page.
router.get('/', function (req, res, next) {
    res.render('pages/index');
});

// Login route
router.get("/login", (req, res)=>{
    res.render("pages/login")
})

// Signup / New Patient Registration route
router.get("/signup", (req, res)=>{
    res.render("pages/newpatient");
})

// Patient flow route
router.get("/patientflow", isAuthenticated, hasRole(['doctor', 'admin']), (req, res)=>{
    res.render("pages/patientflow");
})

// Patient Dashboard route (accessible only to patients)
router.get("/patient", isAuthenticated, hasRole(['patient']), async (req, res) => {
    try {
        const user = req.session.user;
        res.render("pages/dashboards/patient-dashboard", { user });
    } catch (error) {
        console.error("Error loading patient dashboard: ", error);
        res.status(500).send("Internal Server Error");
    }
});

// Doctor Dashboard route (accessible only to doctors)
router.get("/doctor-dashboard", isAuthenticated, hasRole(['doctor']), async (req, res) => {
    try {
        const user = req.session.user;
        // Get doctor-specific data
        const patientsSnapshot = await db.collection('users').where('role', '==', 'patient').get();
        const patients = [];
        patientsSnapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() });
        });
        res.render("pages/dashboards/doctor-dashboard", { user, patients });
    } catch (error) {
        console.error("Error loading doctor dashboard: ", error);
        res.status(500).send("Internal Server Error");
    }
});

// Admin Dashboard route (accessible only to admins)
router.get("/admin-dashboard", isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
        const user = req.session.user;
        // Get admin-specific data
        const allUsersSnapshot = await db.collection('users').get();
        const users = [];
        allUsersSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        // Count by role
        const stats = {
            totalUsers: users.length,
            patients: users.filter(u => u.role === 'patient').length,
            doctors: users.filter(u => u.role === 'doctor').length,
            admins: users.filter(u => u.role === 'admin').length
        };
        
        res.render("pages/dashboards/admin-dashboard", { user, stats, users });
    } catch (error) {
        console.error("Error loading admin dashboard: ", error);
        res.status(500).send("Internal Server Error");
    }
});

// Patient New Registre route
router.get("/newpatient", (req, res)=>{
    res.render("pages/newpatient")
})

// Staff route (admin only)
router.get("/staff", isAuthenticated, hasRole(['admin']), (req, res)=>{
    res.render("pages/staff")
})

// Admin Operations route (admin only)
router.get("/operations", isAuthenticated, hasRole(['admin']), (req, res)=>{
    res.render("pages/operations")
})

module.exports = router;