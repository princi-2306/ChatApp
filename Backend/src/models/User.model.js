import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        index:true   // an optimize method for enabling searching feild
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: 8,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    avatar:{
        type: String,    // cloudnary URL
        default: "default-avatar.jpg",
        required: true
    },
    refreshToken:{
        type: String
    },
    // Now starting modeling according to video
    cartData:{
        type: Object,
        default: {}
        }
    
}, {timestamps:true, minimize: false})

// setting the pre save middleware in the schema.  // bcrypt help us to encrypt the password.
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// creating the custom methods for the mongoose
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)   // this will compare the old password with the new one and return boolean output
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {                   // this is how i am sending the payload
        _id: this._id,
        email: this.email,
        username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {                   // this is how i am sending the payload
        _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.models.user || mongoose.model("User", userSchema);