const mongoose = require("mongoose")

const connectDB =  async () =>  {
    
    try 
    {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        
        console.log("Database Connected Successfully");
        
    } 
    catch (error) 
    {
        console.error("Error WhileConnecting The Database")
        process.exit(1)
    }
}

module.exports = connectDB;