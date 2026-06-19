const mongoose = require("mongoose")

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },

    fileName: {
      type: String ,
      required : true ,
    },

    fileType: {
      type: String ,
      required : true ,
    },

    fileUrl: {
      type: String ,
      required : true ,
    },

    extractedText: {
      type: String ,
      default : ""
    },

    status: {
      type: String ,
      enum: ["uploaded", "processed"],
      default: "uploaded",
    },

  },
  { timestamps: true },
);


const Document = mongoose.model("Document" , DocumentSchema)


module.exports = Document;