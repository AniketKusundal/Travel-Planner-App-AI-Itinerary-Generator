const express = require("express");
const { SignupUser, LoginUser, GetProfile, UpdateProfile, UploadAvatar } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/signup", SignupUser);
router.post("/login", LoginUser);

router.get("/profile", protect, GetProfile);
router.put("/profile", protect, UpdateProfile);
router.post("/upload-avatar", protect, upload.single("file"), UploadAvatar);

module.exports = router;