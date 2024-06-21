import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "password should be min 6 char"],
    },
    avatar: {
      id: {
        type: String,
      
      },
      secure_url: {
        type: String,
       
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

//hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//validate password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;
