import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
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
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10,15}$/, "Phone number should be 10-15 digits"],
    },
    verificationToken:String,
    isverified:{
        type:Boolean,
        default:false,
    }
}, { timestamps: true }); 

const Owner = mongoose.model("Owner", OwnerSchema);
export default Owner;
