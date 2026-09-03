const express = require("express");
const {
  getallnotescontroller,
  createnotescontroller,
  singlenotecontroller,
  updatenotescontroller,
  deletenotescontroller,
  updatenotespatchcontroller,
} = require("../controllers/createnotescontroller");

const router = express.Router();

// create api
router.post("/create", createnotescontroller);
// get api
router.get("/allnotes", getallnotescontroller);

// :id is a route parameter. Since this router is mounted at /notes, /:id becomes /notes/:id, and the actual ID can be accessed through req.params.id.
router.get("/:id", singlenotecontroller);

// update via put
router.put("/:id", updatenotescontroller);

// update via patch
router.patch("/:id/singlenote", updatenotespatchcontroller);

// delete
router.delete("/:id", deletenotescontroller);
module.exports = router;
