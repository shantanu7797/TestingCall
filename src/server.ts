import httpServer from "./app";
import app from "./app";
import { port } from "./config";

// app.listen(port, () => {
//   console.log("⚙️  server running on port http://localhost:5000");
// });
httpServer.listen(5000, () => {
  console.log("⚙️  server running on port http://localhost:5000");
});
