const { resolve } = require('path');
const db=require('../config/connection');
const { reject } = require('promise');
const { error } = require('console');

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
    
    },
    viewservices:function(){
        return new Promise(async function(resolve,reject){
         try{
            let servicesdata=await db.getDB().collection('servicesData').find().toArray()
            resolve(servicesdata)
         }catch(err){
            reject("error viewing the services"+err)
         }
            
        })

    }
}