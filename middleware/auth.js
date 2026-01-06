// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Middleware to check if user has specific role
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        
        if (allowedRoles.includes(req.session.user.role)) {
            return next();
        }
        
        res.status(403).render('pages/403', { 
            message: 'You do not have permission to access this page' 
        });
    };
};

module.exports = { isAuthenticated, hasRole };
