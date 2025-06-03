// config/db.js
const mongoose = require("mongoose");
const SuperAdmin = require("../models/SuperAdmin");
const crypto = require("crypto");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected successfully ✅");
		await checkAndCreateSuperAdmin();

	} catch (error) {
		console.error("MongoDB connection failed ❌:", error);
		process.exit(1);
	}
};
const checkAndCreateSuperAdmin = async () => {
    try {
        const superAdminCount = await SuperAdmin.countDocuments();

        if (superAdminCount === 0) {
            
            const email = process.env.SUPERADMIN_EMAIL;
            const name = process.env.SUPERADMIN_NAME;

            

            const hash = crypto.createHash('sha256')
                               .update(email)
                               .digest('hex');  

            const newSuperAdmin = new SuperAdmin({
                email,
                hash,
                name,
            });

            await newSuperAdmin.save();
            console.log("SuperAdmin created successfully.");
        } else {
            console.log("SuperAdmin already exists.");
        }
    } catch (error) {
        console.error("Error while checking and creating SuperAdmin: ", error.message);
    }
};
module.exports = connectDB;
