import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userScheama = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        default: "none",
    },
    avatar: {
        type: String,
    },
    teamId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Team",
  default: null,
    },
    username : {
        type: String,
        required : true,
        unique: true,
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength:6
    },
    isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
})
userScheama.pre('save', async function(next) {
        // Only hash if the password has been modified (or is new)
        if (!this.isModified('password')) {
            return next();
        }
        try {
            const salt = await bcrypt.genSalt(10); // Generate a salt
            this.password = await bcrypt.hash(this.password, salt); // Hash the password
            next();
        } catch (error) {
            next(error); // Pass any errors to the next middleware
        }
    });
userScheama.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userScheama);