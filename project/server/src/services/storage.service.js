import ImageKit, { toFile } from "@imagekit/nodejs";
import configuris from "../config/config.js";

const client = new ImageKit({
  privateKey: configuris.imagekit_private_key,
});

export async function fileupload({ buffer, filename }) {
  const response = await client.files.upload({
    file: await toFile(buffer),
    fileName: filename,
    folder: "Snitch", //this will create a folder and all the uploaded files will be stored in this file
  });
  return response;
}
