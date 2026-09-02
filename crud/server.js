const express = require("express");

let app = express();
// middleware to accept json data
app.use(express.json());

let user = [];

// read = get
app.get("/", (req, res) => {
  res.send(user);
});

// create = post
app.post("/createuser", (req, res) => {
  let body = req.body;
  user.push(body);
  res.send("user saved ");
  // res.send(user);
});

// delete
app.delete("/deleteuser/:id", (req, res) => {
  // we destructured the "id" because the body returens an obj
  // let body = req.params
  // console.log(body);

  // Params are used to pass values through the URL, such as an ID: /users/:id
  // Access them with req.params, for example: req.params.id

  let { id } = req.params;
  let usersdata = user.filter((val) => val.id !== id);
  user = usersdata;
  res.send("user deleted");
  // res.send(user);
});

// update = put/patch
// completely replaces; missing properties are removed.
app.put("/update/:id", (req, res) => {
  let { id } = req.params;
  let { name, age } = req.body;

  // sstatic values
  // let updateduser = user.map((val) =>
  //   val.id === id ? { id, name: "test", age: 90 } : val,
  // );

  // dynamic values
  let updateduser = user.map((val) =>
    // if we spread the body instead of destructuring then it will behave like patch add new properties 
  // like this -> { ...val, ...req.body }
    val.id === id ? { ...val, name, age } : val,
  );

  res.send(updateduser);
});

// patch , replaces an entity from the obj
// if we add new properties then it will be appende in the obj 
// partially updates; keeps missing properties , if we spread the body obj or else it will replace the obj with the new one 
app.patch("/patchupdate/:id", (req, res) => {
  let { id } = req.params;
  let patchupdate = user.map((val) =>
    // the ...req.body is spread because if we dont spread it it will create a property name body in the obj
    val.id === id ? { ...val, ...req.body } : val,
  );
  res.send(patchupdate);
});

app.listen(3000, () => {});
