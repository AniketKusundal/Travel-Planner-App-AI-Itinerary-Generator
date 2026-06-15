const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const { config } = require("dotenv")


app.use(express.json())
app.use(cors())
app.use(morgan("dev"))


app.get("/" , (req , res) => {

    res.json({Message : "API Is Runing..."})
})

module.exports = app