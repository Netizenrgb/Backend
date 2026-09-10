const multer = require("multer");

// this provides 2 storages disk and memory storages
// disk storage is used to store the data localy -> consist destination and file name and both have call backs

// ftp protocol format
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req is the api call and the file is the file that will be fetched
    // cb first argument is error if no error then its null
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    // this is the actual file namethe Date.now() is used to create a unique file name everytime
    console.log("filename -> ", file);

    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
