
var db=require('../config/connection');
const { ObjectId } = require('mongodb');
module.exports={

addContact: (details)=>{
    try{
        db.getDB().collection('contactUs').insertOne(details);
        console.log('Succesfully inserted the contact details')
    }catch(err){
        console.log("Error inserting the data")
 }
    
},
viewcontact:function(){
    return new Promise(async function(resolve,reject){
        try{
            let condetails=await db.getDB().collection('contactUs').find().toArray()
            resolve(condetails)
        }catch(err){
            reject("error viewing the contact details"+err)

        }
    })
},
deleteContact: function(id){
    return new Promise(async(resolve,reject)=>{
        try{
            var objectid= new ObjectId(id)
       var result=await db.getDB().collection('contactUs').deleteOne({_id:objectid});
       if(result.deletedCount>0){
        resolve("Succesfully deleted the data")
       }else{
        reject("No data found or error deleting the data")
       }
        }catch(err){
            reject(err)
        }
    })
    
}

    
}
