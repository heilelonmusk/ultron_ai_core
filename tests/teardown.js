const { closeServer } = require("./testServer");

afterAll(async () => {
  console.log("🛑 Closing test server...");
  await closeServer();
});