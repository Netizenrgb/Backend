import React from "react";
import CreateNotes from "./pages/CreateNotes";
import ViewAllNotes from "./pages/ViewAllNotes";
import axios from "axios";

const App = () => {
//  note u haveto refresh everytime u add or delete anything becaue the the napp is not re rendering so do it 

  return (
    <div>
      <CreateNotes />
      <ViewAllNotes />
    </div>
  );
};

export default App;
