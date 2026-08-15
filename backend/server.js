const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Product = require("./models/Product");
const {
  authenticateToken,
  requireAdmin
} = require("./middleware/authMiddleware");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
     user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
},
    });
  } catch (error) {
    next(error);
  }
});
app.get(
  "/api/admin/test",
  authenticateToken,
  requireAdmin,
  (req, res) => {

    res.json({
      message: "Welcome Admin!",
      admin: req.user
    });

  }
);
app.get(
  "/api/admin/dashboard",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {

    try {

      const totalProducts = await Product.countDocuments();

      const totalUsers = await User.countDocuments({
        role: "user",
      });

      res.json({
        message: "Admin dashboard",
        admin: req.user,
        statistics: {
          totalProducts,
          totalUsers,
        },
      });

    } catch (error) {

      next(error);

    }

  }
);
app.post(
  "/api/admin/products",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {

    try {

      const {
        name,
        brand,
        category,
        price,
        unit,
        stock,
        image,
        description,
        isPopular,
      } = req.body;


      if (
        !name ||
        !category ||
        price === undefined ||
        !unit ||
        stock === undefined
      ) {

        return res.status(400).json({
          message: "Name, category, price, unit and stock are required.",
        });

      }


      const product = await Product.create({

        name,

        brand: brand || "Local Farm",

        category,

        price,

        unit,

        stock,

        image: image || "",

        description: description || "",

        isPopular: isPopular || false,

      });


      res.status(201).json({

        message: "Product added successfully",

        product,

      });

    } catch (error) {

      next(error);

    }

  }
);
app.get(
  "/api/admin/products",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {

    try {

      const products = await Product.find()
        .sort({ createdAt: -1 });

      res.json({
        products,
      });

    } catch (error) {

      next(error);

    }

  }
);
app.delete(
  "/api/admin/products/:id",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {

    try {

      const product = await Product.findByIdAndDelete(
        req.params.id
      );


      if (!product) {

        return res.status(404).json({
          message: "Product not found",
        });

      }


      res.json({
        message: "Product deleted successfully",
      });

    } catch (error) {

      next(error);

    }

  }
);
app.put(
  "/api/admin/products/:id",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {

    try {

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


      if (!product) {

        return res.status(404).json({
          message: "Product not found",
        });

      }


      res.json({

        message: "Product updated successfully",

        product,

      });

    } catch (error) {

      next(error);

    }

  }
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

app.listen(PORT, () => {
  console.log(`SmartBasket backend running on port ${PORT}`);
});
