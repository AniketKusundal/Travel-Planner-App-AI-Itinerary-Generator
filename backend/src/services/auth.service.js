const User = require("../models/User.model")
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
    token,
  };


};


module.exports = {
    SignupUser ,
    LoginUser
}