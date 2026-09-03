const NotesModel = require("../models/notes.model");

// create controller
const createnotescontroller = async (req, res) => {
  try {
    let { title, description } = req.body;
    let newnote = await NotesModel.create({
      title,
      description,
    });

    return res.status(201).json({
      message: "Note created successfully",
      data: newnote,
    });
  } catch (error) {
    //Log the error for server-side debugging, but also send an appropriate error response to the client so the request does not remain unresolved.

    console.log("Error in create api -> ", error);

    return res.status(500).json({
      message: "Failed to create note",
      error: error.message,
    });
  }
};

// get all data controller
const getallnotescontroller = async (req, res) => {
  try {
    let getnotes = await NotesModel.find();
    res.status(200).json({
      message: "All notes ",
      data: getnotes,
    });
  } catch (error) {
    console.log("Error in get api -> ", error);
    return res.status(500).json({
      message: "Unable to fetch notes",
      error: error.message,
    });
  }
};

// getsingleelement by id
const singlenotecontroller = async (req, res) => {
  try {
    let singlenoteid = req.params.id;
    let note = await NotesModel.findById(singlenoteid);

    res.status(200).json({
      message: "Notes Fetched Successfully ",
      data: note,
    });
  } catch (error) {
    console.log("Error in the single note api -> ", error);
    return res.status(500).json({
      message: "Unable to fetch notes",
      error: error.message,
    });
  }
};

// update via put (controller)
const updatenotescontroller = async (req, res) => {
  try {
    let body = req.body;
    let updatenotesid = req.params.id;
    let updatednotes = await NotesModel
      // By default, findByIdAndUpdate() returns the document before the update. Use { new: true } to return the updated document instead.
      .findByIdAndUpdate(updatenotesid, body, { new: true });

    return res.status(200).json({
      message: "Notes updated",
      data: updatednotes,
    });
  } catch (error) {
    console.log("Error in update api -> ", error);
    return res.status(500).json({
      message: "Not able to update the notes ",
      error: error.message,
    });
  }
};

// update via patch
const updatenotespatchcontroller = async (req, res) => {
  try {
    let noteid = req.params.id;
    let body = req.body;
    let patchupdate = await NotesModel.findByIdAndUpdate(noteid, body);

    return res.status(200).json({
      message: "Updated successfully",
      data: patchupdate,
    });
  } catch (error) {
    console.log("Error in the patch api -> ", error);
    return res.status(500).json({
      message: "Failed to update",
      error: error.message,
    });
  }
};

const deletenotescontroller = async (req, res) => {
  try {
    let delnotes = req.params.id;
    await NotesModel.findByIdAndDelete(delnotes);

    return res.status(200).json({
      message: "Notes deleted ",
    });
  } catch (error) {
    console.log("error in the delete api -> ", error);

    return res.status(500).json({
      message: "Error in deleting",
    });
  }
};

module.exports = {
  createnotescontroller,
  getallnotescontroller,
  singlenotecontroller,
  updatenotescontroller,
  deletenotescontroller,
  updatenotespatchcontroller,
};
