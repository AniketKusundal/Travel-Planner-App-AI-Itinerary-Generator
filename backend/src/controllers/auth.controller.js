const authServices = require("../services/auth.service")


const SignupUser = async(req , res) => {

    try 
    {
        const regiester = await authServices.SignupUser(req.body)

        return res.status(201).json({
            Message : "User Regiester Successfully",
            data : regiester
        })
    } 
    catch (error)
    {
        return res.status(400).json({
            Message : "Error While Regiester User " + error.message
        })
    }
    
}

const LoginUser = async(req , res) => {

    try 
    {
        const login = await authServices.LoginUser(req.body)

        return res.status(200).json({
            Message : "User Login Successfully",
            data : login
        })
    } 
    catch (error) 
    {
        return res.status(400).json({
            Message : "Error While Login User " + error.message
        })
    }
    
}


const GetProfile = async (req, res) => {
  try {
    const profile = await authServices.GetProfile(req.user._id);
    return res.status(200).json({
      Message: "Profile Fetched Successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      Message: "Error Fetching Profile: " + error.message,
    });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const updated = await authServices.UpdateProfile(req.user._id, req.body);
    return res.status(200).json({
      Message: "Profile Updated Successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      Message: "Error Updating Profile: " + error.message,
    });
  }
};

const { uploadStreamToCloudinary } = require("../config/cloudinary");

const UploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ Message: "No image file provided" });
    }

    let avatarUrl = "";
    const cloudRes = await uploadStreamToCloudinary(req.file.buffer, "profile_avatars");

    if (cloudRes && cloudRes.secure_url) {
      avatarUrl = cloudRes.secure_url;
    } else {
      // Fallback to Data URL for instant display without Cloudinary
      avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Save to user profile directly
    const updatedUser = await authServices.UpdateProfile(req.user._id, { avatar: avatarUrl });

    return res.status(200).json({
      Message: "Avatar uploaded successfully",
      avatarUrl,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      Message: "Error uploading avatar: " + error.message,
    });
  }
};

module.exports = {
  SignupUser,
  LoginUser,
  GetProfile,
  UpdateProfile,
  UploadAvatar,
};