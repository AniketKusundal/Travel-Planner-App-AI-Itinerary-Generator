const express = require("express")
const {SignupUser , LoginUser} = require("../controllers/auth.controller")

const router = express.Router()


router.post("/signup" , SignupUser)

router.post("/login" , LoginUser)


module.exports = router