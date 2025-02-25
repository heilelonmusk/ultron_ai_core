const { disconnectMongoDB } = require("../config/connectMongoDB");

module.exports = async () => {
  console.log("🛑 Running global teardown: Closing MongoDB...");
  await disconnectMongoDB();
};