const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();


const userSchema = new mongoose.Schema({

  name: String,

  email: {
    type: String,
    unique: true
  },

  password: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

});


const User = mongoose.model("User", userSchema);


async function createAdmin() {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");


    const existingAdmin = await User.findOne({
      email: "sejutimona2108@gmail.com"
    });


    if (existingAdmin) {

      console.log("Admin already exists");

      process.exit();

    }


    const hashedPassword = await bcrypt.hash(
      "admin123",
      10
    );


    const admin = new User({

      name: "SmartBasket Admin",

      email: "sejutimona2108@gmail.com",

      password: hashedPassword,

      role: "admin"

    });


    await admin.save();


    console.log("Admin created successfully");

    console.log("Email: sejutimona2108@gmail.com");

    console.log("Password: admin123");


    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);

  }

}


createAdmin();