const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connect to the database
module.exports = connectDataBase = async () => {
  try {
    // Establish database connection
    const databaseConnection = await mongoose.connect(process.env.DB);
    console.log(`Database connected ::: ${databaseConnection.connection.host}`);
  } catch (error) {
    console.error(`Error::: ${error.message}`);
    process.exit(1);
  }
};