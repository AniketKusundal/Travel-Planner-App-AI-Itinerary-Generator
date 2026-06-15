const jwt = require("jsonwebtoken")


const genrateToken = (userId) => {

    return jwt.sign(

        {
            id : userId
        },

        process.env.JWT_SECRET,
        {
            expiresIn : "7d"
        }
    )
}

module.exports  = genrateToken;