/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';

const username = process.env.NOTIFICATION_MONGO_USERNAME;
const password = process.env.NOTIFICATION_MONGO_PASSWORD;
const cluster = process.env.NOTIFICATION_MONGO_CLUSTER;
const databasename = process.env.NOTIFICATION_MONGO_DATABASENAME;

// const mongoUrl = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${databasename}?retryWrites=true&w=majority`;
// console.log(mongoUrl);
// const mongoUrl = 'mongodb://127.0.0.1:27017/inventory';
// const mongoUrl = `mongodb://10.206.4.131:27017/${databasename}`;
const mongoUrl = `${process.env.MONGO_URL}${databasename}?retryWrites=true&w=majority`;

const database = async () => {
  try {
    const conn = await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`🔗🔗🔗🔗 MongoDB Connected: ${conn.connection.host} 🔗🔗🔗🔗`);
    console.log('Connection to the database is successful✅.');
  } catch (error) {
    console.error(
      `🔗‍💥🔗‍💥🔗‍💥🔗‍💥  ${error.message} 🔗‍💥🔗‍💥🔗‍💥🔗‍💥`
    );
    console.log('Could not connect to the database.', error);
    process.exit(1);
  }
};

export default database;
