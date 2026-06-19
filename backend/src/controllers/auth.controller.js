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


module.exports = {
    SignupUser ,
    LoginUser 
}