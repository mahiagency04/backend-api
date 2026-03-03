import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
    static userRegistration = async (req, res) => {
        const { name, Medical_Store_Name, City, GSTIN, Mobile_NO, Email, Password, Confirm_Password } = req.body

        if (
            !name ||
            !Medical_Store_Name ||
            !City ||
            !GSTIN ||
            !Mobile_NO ||
            !Email ||
            !Password ||
            !Confirm_Password
        ) {
            return res.status(400).send({
                status: "failed",
                message: "All fields are required"
            });
        }

        const allowedCities = ["azamgarh", "mau", "ambedkarnagar"];

        const userCity = City.trim().toLowerCase();

         if (!allowedCities.includes(userCity)) {
        return res.status(400).send({
            status: "failed",
            message: "Service available only in Azamgarh, Mau and Ambedkarnagar"
        });
    }

        const mobileRegex = /^[0-9]{10}$/;

        if (!mobileRegex.test(Mobile_NO)) {
            return res.status(400).send({
                status: "failed",
                message: "Mobile number must be 10 digits only"
            });
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (!emailRegex.test(Email)) {
            return res.status(400).send({
                status: "failed",
                message: "Please enter a valid email address"
            });
        }

        if (Password.length < 6) {
            return res.status(400).send({
                status: "failed",
                message: "Password must be at least 6 characters long"
            });
        }

        if (Password !== Confirm_Password) {
            return res.status(400).send({
                status: "failed",
                message: "Password and Confirm Password doesn't match"
            });
        }

        const user = await UserModel.findOne({ $or: [{ Email: Email }, { GSTIN: GSTIN }, { Mobile_NO: Mobile_NO }] })
        if (user) {
            return res.status(409).send({
                "status": "failed",
                "message":
                    "User already exists"
            })
        } else {
            if (name && Medical_Store_Name && City && GSTIN && Mobile_NO && Email && Password && Confirm_Password) {
                try {
                    const salt = await bcrypt.genSalt(10)
                    const hashPassword = await bcrypt.hash(Password, salt)
                    const doc = new UserModel({
                        name: name,
                        Medical_Store_Name: Medical_Store_Name,
                        City: City,
                        GSTIN: GSTIN,
                        Mobile_NO: Mobile_NO,
                        Email: Email,
                        Password: hashPassword
                    })
                    await doc.save()
                    const saved_user = await UserModel.findOne({ Email: Email })
                
                    const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })
                    return res.status(201).send({
                        "status": "Success", "message": "Registration Success", "token": token,
                        user: {
                            name: saved_user.name,
                            Medical_Store_Name: saved_user.Medical_Store_Name,
                            GSTIN: saved_user.GSTIN
                        }
                    })
                } catch (error) {
                    console.log(error)
                    return res.send({ "status": "failed", "message": "Unable to Register" })
                }
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { identifier, password } = req.body

            
            if (!identifier || !password) {
                return res.status(400).send({
                    status: "failed",
                    message: "Email/Mobile and Password are required",
                });
            }

            
            let user;
            if (identifier.includes("@")) {
                
                user = await UserModel.findOne({ Email: identifier });
            } else {
                
                user = await UserModel.findOne({ Mobile_NO: identifier });
            }

            
            if (!user) {
                return res.status(404).send({
                    status: "failed",
                    message: "You are not a registered user",
                })
            }

            
            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                return res.status(401).send({
                    status: "failed",
                    message: "Invalid credentials",
                });
            }

            
            const token = jwt.sign(
                { userID: user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "5d" }
            );

            
            res.status(200).send({
                status: "success",
                message: "Login Successful",
                token,
                user: {
                    name: user.name,
                    Medical_Store_Name: user.Medical_Store_Name,
                    GSTIN: user.GSTIN
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                status: "failed",
                message: "Unable to login",
            });
        }
    };

     
    // static changeUserPassword = async (req, res) => {
    //     const { Current_Password, Confirm_Password } = req.body
    //     if (Password && Confirm_Password) {
    //         if (Password !== Confirm_Password) {
    //             res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn,t match" })
    //         } else {
    //             const salt = await bcrypt.genSalt(10)
    //             const newhashPassword = await bcrypt.hash(Password, salt)
    //             await UserModel.findByIdAndUpdate(req.user._id, { $set: { Password: newhashPassword } })
    //             res.send({ "status": "success", "message": "Password Changed Successfully" })
    //         }
    //     } else {
    //         res.send({ "status": "failed", "message": "All Fields are Required" })
    //     }
    // }

  static changeUserPassword = async (req, res) => {
    const { Current_Password, Password, Confirm_Password } = req.body;
    if (!Current_Password || !Password || !Confirm_Password) {
        return res.send({ status: "failed", message: "All fields are required" });
    }

    const user = await UserModel.findById(req.user._id);

    const isMatch = await bcrypt.compare(Current_Password, user.Password);
    if (!isMatch) {
        return res.send({ status: "failed", message: "Current Password is incorrect" });
    }

    if (Password !== Confirm_Password) {
        return res.send({ status: "failed", message: "New Password and Confirm Password do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const newhashPassword = await bcrypt.hash(Password, salt);
    await UserModel.findByIdAndUpdate(req.user._id, { $set: { Password: newhashPassword } });

    res.send({ status: "success", message: "Password Changed Successfully" });
};


    static loggedUser = async (req, res) => {
        res.status(200).send({ "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { Email } = req.body;

        if (!Email) {
            return res.status(400).send({
                status: "failed",
                message: "Email field is required",
            });
        }

        const user = await UserModel.findOne({ Email: Email });

        if (!user) {
            return res.status(404).send({
                status: "failed",
                message: "Email doesn't exist",
            });
        }

        try {
            
            const token = jwt.sign(
                { userID: user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "15m" }
            );

            const link = `http://192.168.29.234:5173/reset-password/${user._id}/${token}`;
            console.log("Password reset link:", link);

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.Email,
                subject: "Mahi Agency - Password Reset Link",
                html: `<p>Click the link below to reset your password:</p><a href="${link}">Reset Password</a>`,
            });

            return res.status(200).send({
                status: "success",
                message: "Password reset email sent. Please check your inbox.",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).send({
                status: "failed",
                message: "Unable to send email. Try again later.",
            });
        }
    };


    static userPasswordReset = async (req, res) => {
        const { Password, Confirm_Password } = req.body;
        const { id, token } = req.params;

        if (!Password || !Confirm_Password) {
            return res.status(400).send({
                status: "failed",
                message: "All Fields are Required",
            });
        }

        if (Password !== Confirm_Password) {
            return res.status(400).send({
                status: "failed",
                message: "Password and Confirm New Password doesn't match",
            });
        }

        try {
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).send({
                    status: "failed",
                    message: "User not found",
                });
            }

            const secret = process.env.JWT_SECRET_KEY;

            const payload = jwt.verify(token, secret);

            if (payload.userID !== id) {
                return res.status(400).send({
                    status: "failed",
                    message: "Token is invalid for this user",
                });
            }

            const salt = await bcrypt.genSalt(10);
            const newhashPassword = await bcrypt.hash(Password, salt);

            await UserModel.findByIdAndUpdate(user._id, {
                $set: { Password: newhashPassword },
            });

            return res.status(200).send({
                status: "success",
                message: "Password Reset Successfully",
            });

        } catch (error) {
            console.error("Password Reset Error:", error.message);
            return res.status(400).send({
                status: "failed",
                message: "Token expired or invalid",
            });
        }
    };

// static saveAddress = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.user._id)

//     if (!user) {
//       return res.status(404).send({ status: "failed", message: "User not found" })
//     }

//     user.address = req.body
//     await user.save()

//     res.send({
//       status: "success",
//       message: "Address saved successfully"
//     })

//   } catch (error) {
//     res.status(500).send({
//       status: "failed",
//       message: "Error saving address"
//     })
//   }
// }

// static getAddress = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.user._id)

//     res.send({
//       status: "success",
//       address: user.address
//     })

//   } catch (error) {
//     res.status(500).send({
//       status: "failed",
//       message: "Error fetching address"
//     })
//   }
// }

// static deleteAddress = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.user._id)

//     if (!user) {
//       return res.status(404).send({
//         status: "failed",
//         message: "User not found"
//       })
//     }

//     user.address = undefined  
//     await user.save()

//     res.send({
//       status: "success",
//       message: "Address deleted successfully"
//     })

//   } catch (error) {
//     res.status(500).send({
//       status: "failed",
//       message: "Error deleting address"
//     })
//   }
// }

static addAddress = async (req, res) => {
  try {
    const { state, city, area, landmark, pincode } = req.body;

    if (!pincode || !state || !city || !area) {
      return res.status(400).send({
        status: "failed",
        message: "All address fields are required",
      });
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        status: "failed",
        message: "User not found",
      });
    }

    user.addresses.push({
      state,
      city,
      area,
      landmark: landmark || "",
      pincode 
    });

    await user.save();

    return res.status(201).send({
      status: "success",
      message: "Address added successfully",
      addresses: user.addresses,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Error adding address",
    });
  }
};

static getAddresses = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        status: "failed",
        message: "User not found",
      });
    }

    return res.status(200).send({
      status: "success",
      addresses: user.addresses,
    });

  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Error fetching addresses",
    });
  }
};

static updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { pincode, state, city, area, landmark } = req.body;

    
    if (!pincode || !state || !city || !area) {
      return res.status(400).send({
        status: "failed",
        message: "All fields are required",
      });
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        status: "failed",
        message: "User not found",
      });
    }

    
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).send({
        status: "failed",
        message: "Address not found",
      });
    }


    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex]._doc,
      state,
      city,
      area,
      landmark,
      pincode,
    };
    
    await user.save();

    return res.status(200).send({
      status: "success",
      message: "Address updated successfully",
      updatedAddress: user.addresses[addressIndex],
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Error updating address",
    });
  }
};

static deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        status: "failed",
        message: "User not found",
      });
    }

    const addressExists = user.addresses.some(
      (addr) => addr._id.toString() === addressId
    );

    if (!addressExists) {
      return res.status(404).send({
        status: "failed",
        message: "Address not found",
      });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    return res.status(200).send({
      status: "success",
      message: "Address deleted successfully",
    });

  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Error deleting address",
    });
  }
};

static editDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        Medical_Store_Name: req.body.Medical_Store_Name,
        City: req.body.City,
        GSTIN: req.body.GSTIN,
        Mobile_NO: req.body.Mobile_NO,
        Email: req.body.Email
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Details Updated successfully",
      user: updatedUser
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// static editDetails = async (req, res) => {
//   try {

//  if (!req.user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     const userId = req.user._id;

//     const updateData = {};

//     if (req.body.name !== undefined) updateData.name = req.body.name;
//     if (req.body.Medical_Store_Name !== undefined)
//       updateData.Medical_Store_Name = req.body.Medical_Store_Name;
//     if (req.body.City !== undefined) updateData.City = req.body.City;
//     if (req.body.GSTIN !== undefined) updateData.GSTIN = req.body.GSTIN;
//     if (req.body.Mobile_NO !== undefined) updateData.Mobile_NO = req.body.Mobile_NO;
//     if (req.body.Email !== undefined) updateData.Email = req.body.Email;

//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user: updatedUser
//     });

//   } catch (error) {
//     return res.status(400).json({
//       message: error.message
//     });
//   }
// };



    static userLogout = async (req, res) => {
        try {
            res.status(200).send({
                status: "success",
                message: "Logout successfully"
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                status: "failed",
                message: "Unable to logout"
            })
        }
    }

}

export default UserController