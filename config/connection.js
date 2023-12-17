const { MongoClient } = require('mongodb');

const state={
    db:null
}
module.exports.connect =async  function () {
    try {
        const url = 'mongodb://127.0.0.1:27017'; // Replace with your MongoDB URL
        const dbName = 'PriTechSolutions'; // Replace with your database name

        const client =await MongoClient.connect(url);

        state.db = client.db(dbName);
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports.getDB = function () {
    return state.db
};