const express = require("express");
const { create } = require("../controller/user.controller");
const upload = require("../config/multer.file");
const router = express.Router();

router.post(
  "/create",
  // upload.array("profilepic",5) ->5 is the limit
  // that much files can be uploaded at a time  
  upload.array("profilepic",5),
  // the field name in the upload.single() has to be same in both the backend and frontend
  create,
);

module.exports = router;
