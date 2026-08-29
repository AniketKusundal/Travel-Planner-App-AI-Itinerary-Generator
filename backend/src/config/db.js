const mongoose = require("mongoose")

const connectDB =  async () =>  {
    
    try 
    {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        
        console.log("Database Connected Successfully");
        
    } 
    catch (error) 
    {
        console.error("Database Connection Error:", error.message)
        process.exit(1)
    }
}

module.exports = connectDB;