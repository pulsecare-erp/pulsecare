var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
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

// POST Signup route
router.post("/signup", async (req, res) => {
    try {
        const { email, password, confirmPassword, firstName, phone, role } = req.body;
        
        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Passwords do not match" 
            });
        }

        // Validate required fields
        if (!email || !password || !firstName || !role) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, password, name, and role are required" 
            });
        }

        // Validate role
        const validRoles = ['patient', 'doctor', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role selected" 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters long" 
            });
        }

        // Check if user already exists
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ 
                success: false, 
                message: "User with this email already exists" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const newUserRef = db.collection('users').doc();
        await newUserRef.set({
            email,
            password: hashedPassword,
            name: firstName,
            phone: phone || '',
            role: role,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            userId: newUserRef.id,
            redirect: "/login"
        });
    } catch (error) {
        console.error("Error during signup: ", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});

// POST Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        // Find user by email
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (userSnapshot.empty) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        const userId = userDoc.id;

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Set session
        req.session.user = {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role || 'patient'
        };

        // Redirect based on role
        let redirect = "/patient";
        if (user.role === 'admin') {
            redirect = "/admin-dashboard";
        } else if (user.role === 'doctor') {
            redirect = "/doctor-dashboard";
        }

        res.status(200).json({ 
            success: true, 
            message: "Login successful",
            user: req.session.user,
            redirect: redirect
        });

    } catch (error) {
        console.error("Error during login: ", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});

// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.redirect("/login");
    });
});

module.exports = router;