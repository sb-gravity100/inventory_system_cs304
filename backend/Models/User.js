// mongoose user model
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "manager", "staff"],
    required: true,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const pepper = process.env.BCRYPT_PEPPER || "";
  this.password = await bcrypt.hash(this.password + pepper, 10);
});

const User = mongoose.model("User", userSchema);

export default User;
