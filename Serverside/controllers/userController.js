// controllers/userController.js
import User from "../models/user.js";
import path from "path";
import multer from "multer";

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

export const upload = multer({ storage });

// GET profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const updates = { name, email, bio };

    if (req.file) {
      updates.profilePic = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const searchUsers = async (req, res) => {
//   try {
//     const { query } = req.query;
//     if (!query?.trim()) return res.json([]);

//     // 🔍 now search by "name" instead of username
//     const users = await User.find({
//       name: { $regex: query, $options: "i" },
//     }).select("_id name email profilePic");

//     res.json(users);
//   } catch (err) {
//     console.error("Search error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "name username profilePic");

    // filter out any null/undefined
    const friends = (user.friends || []).filter(f => f);

    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const searchUsersByName = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json([]);
    const users = await User.find({ name: { $regex: q, $options: "i" } })
      .select("_id name email profilePic");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};
