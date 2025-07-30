import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminSchema = new Schema({
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
    refreshToken:{
        type: String
    }
}, {timestamps:true})

// setting the pre save middleware in the schema.  // bcrypt help us to encrypt the password.
adminSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// creating the custom methods for the mongoose
adminSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)   // this will compare the old password with the new one and return boolean output
}

adminSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {                   // this is how i am sending the payload
        _id: this._id,
        email: this.email,
        },
        process.env.ADMIN_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY
        }
    )
}

adminSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {                   // this is how i am sending the payload
        _id: this._id
        },
        process.env.ADMIN_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.models.user || mongoose.model("Admin", adminSchema);