import crypto from "crypto";

/* 
generates a 6 character unique code for url
*/

/* 
crypto is used to generate random values 
*/

const generatecode = () => {
  const mainstring =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortcode = "";

  for (let i = 0; i < 6; i++) {
    shortcode += mainstring.charAt(Math.floor(Math.random() * 62));
    // *62 because we have 62 chars in the main string
  }
  return shortcode;
};

export default generatecode;
