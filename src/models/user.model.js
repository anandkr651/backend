import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,  //searchable banana hai us field mi index:true ko add kar do
        },
        email: {
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            require: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,  //cloudinary url
            require: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            require: [true, "password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); //isModified means it can check that the password field is come or not.
//if the user can change the avatar then it can save it.in this way the password field not come.
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); //return boolean
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username, //this.username jo hai database se rahi hai AND username jo hai payload hai 
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};
export const User = mongoose.model("User", userSchema);
