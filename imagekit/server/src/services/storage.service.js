import ImageKit, { toFile } from "@imagekit/nodejs";
import dotenv from "dotenv";

dotenv.config();

const imagekitinstance = new ImageKit({
  privateKey: process.env.ik_private_key,
});

export const sendfiles = async (file, fileName) => {
  const imageFile = await toFile(file, fileName);

  const result = await imagekitinstance.files.upload({
    file: imageFile,
    fileName,
    folder: "cohort-3",
  });



  return result;
};

export default sendfiles;
