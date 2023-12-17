const db=require('../config/connection');

module.exports={
    addservices:function(details,callback){
        try{
            db.getDB().collection('servicesData').insertOne(details).then((data)=>{
                console.log("Succesfully inserted the service details in the DB")
                callback(data.insertedId)
                
            })
            

        }
        catch{
            console.log('error uploading the service details in the database')
            callback(false)
        }
    
    }
}