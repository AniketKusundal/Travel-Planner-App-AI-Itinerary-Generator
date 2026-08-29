const User = require("../models/user.model");
const bcrypt = require("bcryptjs")
const genrateToken = require("../utils/generateToken")

const SignupUser = async ({name , email , password}) => {

    const existingUser = await User.findOne({email})

    if (existingUser) {
        throw new Error("User Already Exist")
    }

    const salt = await bcrypt.genSalt(10)

    const hashPassword =  await bcrypt.hash(password , salt)


    const user = await User.create({
        name , 
        email ,
        password : hashPassword
    })

    // return user data

    return {

        _id : user._id ,
        name : user.name ,
        email : user.email
    }
}   


//  Login user

const LoginUser = async ({ email, password }) => {
  //  find user

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User Not Found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("You Entered A Wrong Password");
  }

  const token = genrateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    homeAirport: user.homeAirport || "",
    travelStyle: user.travelStyle || "Moderate Explorer",
    favoriteDestinations: user.favoriteDestinations || "",
    emergencyContact: user.emergencyContact || "",
    emergencyPhone: user.emergencyPhone || "",
    passportExpiry: user.passportExpiry || "",
    bio: user.bio || "",
    token,
  };
};

const GetProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User Not Found");
  return user;
};

const UpdateProfile = async (userId, updateData) => {
  const allowedFields = [
    "name",
    "avatar",
    "homeAirport",
    "travelStyle",
    "favoriteDestinations",
    "emergencyContact",
    "emergencyPhone",
    "passportExpiry",
    "bio",
  ];

  const updateObj = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updateObj[field] = updateData[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(userId, updateObj, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) throw new Error("User Not Found");
  return updatedUser;
};

module.exports = {
  SignupUser,
  LoginUser,
  GetProfile,
  UpdateProfile,
};