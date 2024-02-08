const { MongoClient } = require('mongodb');

const state={
    db:null
}
module.exports.connect =async  function () {
    try {
        const url = 'mongodb+srv://prijitht4:raistar1111p@cluster0.gxaf11j.mongodb.net'; 
        const dbName = 'PriTechSolutions'; 

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