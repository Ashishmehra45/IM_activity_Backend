const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // ⚠️ JWT_SECRET wahi rakhna jo login process me hai
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "apna_secret_yaha_daalo");

        // 🔥 TERE CONTROLLER KE LIYE FIX:
        // Agar login me { user: { id: ... } } bheja tha toh decoded.user lo
        // Agar login me seedha { id: ... } bheja tha toh decoded lo
        req.user = decoded.user || decoded;

        // Role check (Admin hona chahiye)
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = adminMiddleware;