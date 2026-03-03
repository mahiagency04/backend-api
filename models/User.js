import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    Medical_Store_Name: { type: String, required: true, trim: true },
    City: { type: String, required: true, trim: true },
    GSTIN: { type: String, required: true, unique: true },
    Mobile_NO: { type: String, required: true, unique: true, match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"] },
    Email: { type: String, required: true, unique: true, match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ] },
    Password: { type: String, required: true, trim: true, minlength: 6},
      profileImage: { type: String },

    // address: {
    //     // name: { type: String },
    //     // phone: { type: String },
    //     // altPhone: { type: String },
    //     pincode: { type: String },
    //     state: { type: String },
    //     city: { type: String },
    //     area: { type: String },
    //     landmark: { type: String }
    // }

    addresses: [
        {
            pincode: String,
            state: String,
            city: String,
            area: String,
            landmark: String
        }
    ],
    
})

const UserModel = mongoose.model("user", userSchema)

export default UserModel


