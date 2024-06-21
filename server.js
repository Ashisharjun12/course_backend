import app from "./src/app.js";
import { _config } from "./src/config/config.js";
import connectdb from "./src/config/database.js";

const startServer = async () => {
  //add port
  const port = _config.PORT || 4000;

  //connect to db
  await connectdb();

  // app.get("/", (req, res) => {
  //   console.log("server is running....👋🏻");
  // });

  app.listen(port, () => {
    console.log(`server is running at ${port}`);
  });
};

startServer();
