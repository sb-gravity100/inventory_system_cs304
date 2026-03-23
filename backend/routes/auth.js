import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import { verifyAdmin, verifyToken } from "../middlewares.js";
import Log from "../Models/Log.js";

const router = Router();

router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).select(
    "-password",
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const user = await User.findOne({ username });
  console.log("Login attempt for user:", username);
  if (!user) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  const pepper = process.env.BCRYPT_PEPPER || "";
  const isPasswordValid = await bcrypt.compare(password + pepper, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  const token = jwt.sign(
    { username: user.username, role: user.role, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  const log = new Log({
    event: "USER_LOGIN",
    message: `User ${username} logged in`,
    actor: user._id,
  });
  await log.save();
  res.json({ token, user: { username: user.username, role: user.role } });
});

// router.post("/register", async (req, res) => {
//   const { username, password, role, adminToken } = req.body;
//   if (adminToken) {
//     try {
//       const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
//       if (decoded.role !== "admin") {
//         return res.status(403).json({ message: "Forbidden" });
//       }
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid admin token" });
//     }
//   }
//   const existingUser = await User.findOne({ username });
//   if (existingUser) {
//     return res.status(409).json({ message: "Username already exists" });
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({
//     username,
//     password: hashedPassword,
//     role: role || "staff",
//   });
//   await newUser.save();
//   res.status(201).json({ message: "User registered successfully" });
// });

// router.post("/change-password", async (req, res) => {
//   const { username, oldPassword, newPassword } = req.body;
//   const user = await User.findOne({ username });
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
//   if (!isOldPasswordValid) {
//     return res.status(401).json({ message: "Old password is incorrect" });
//   }
//   const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//   user.password = hashedNewPassword;
//   await user.save();
//   res.json({ message: "Password changed successfully" });
// });

router.post(
  "/admin-change-password",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ message: "Username and newPassword are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    await Log.create({
      event: "USER_PASSWORD_CHANGED",
      message: `Admin ${req.user.username} changed password for ${username}`,
      actor: req.user.id,
      target_user: user._id,
    });
    res.json({ message: "Password changed successfully by admin" });
  },
);

router.post(
  "/admin-create-user",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const validRoles = ["admin", "manager", "staff"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Role must be admin, manager, or staff" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const newUser = new User({
      username,
      password,
      role: role || "staff",
    });
    await newUser.save();
    await Log.create({
      event: "USER_CREATED",
      message: `Admin ${req.user.username} created user ${username}`,
      actor: req.user.id,
      target_user: newUser._id,
    });
    res.status(201).json({ message: "User created successfully by admin" });
  },
);

router.post(
  "/admin-delete-user",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.deleteOne({ username });
    await Log.create({
      event: "USER_DELETED",
      message: `Admin ${req.user.username} deleted user ${username}`,
      actor: req.user.id,
      target_user: user._id,
    });
    res.json({ message: "User deleted successfully by admin" });
  },
);

router.post(
  "/admin-update-user",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const { username, newUsername, newRole } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const validRoles = ["admin", "manager", "staff"];
    if (newRole && !validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Role must be admin, manager, or staff" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (newUsername && newUsername !== username) {
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        return res.status(409).json({ message: "New username already exists" });
      }
      user.username = newUsername;
    }
    if (newRole && newRole !== user.role) {
      user.role = newRole;
    }
    await user.save();
    await Log.create({
      event: "USER_UPDATED",
      message: `Admin ${req.user.username} updated user ${username} to ${newUsername || username} with role ${newRole || user.role}`,
      actor: req.user.id,
      target_user: user._id,
    });
    res.json({ message: "User updated successfully by admin" });
  },
);

router.get("/admin/list-users", verifyToken, verifyAdmin, async (req, res) => {
  // exclude req.user.username from the list
  const users = await User.find({
    username: { $ne: req.user.username },
  }).select("-password");
  res.json(users);
});

router.get("/admin/user/:id", verifyToken, verifyAdmin, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

router.post("/manager-admin-request", verifyToken, async (req, res) => {
  if (req.user.role !== "manager") {
    return res
      .status(403)
      .json({ message: "Forbidden: Manager access required" });
  }
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }
  res.json({ message: "Manager admin request logged successfully" });
});

export default router;
