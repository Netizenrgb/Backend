const create = (req, res) => {
  console.log("yoooyoy");
  // console.log(req.file); for .single
  console.log(req.body);

  console.log(req.files);
};

module.exports = { create };
