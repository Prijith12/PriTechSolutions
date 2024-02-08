const { resolve } = require('path');
const db=require('../config/connection');
const {ObjectId}=require('mongodb')

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

    },
    viewOneService: function(id){
        return new Promise(async(resolve,reject)=>{
            try{
             var objectId=new ObjectId(id);
             var data=await db.getDB().collection('servicesData').findOne({_id:objectId});
             resolve(data)
            }catch{
                reject("error viewing a single services data to edit")
            }
        })

    },
    editService:function(data,id){
        return new Promise((resolve,reject)=>{
            try{
                var objectId=new ObjectId(id)
                db.getDB().collection('servicesData').updateOne({_id:objectId},{$set:{title:data.title,describtion:data.describtion}}).then((result)=>{
                    if(result){
                        resolve("editted successfully")
                    }else{
                        reject('error')
                    }
                })
            }catch{
                reject("error editing the details")

            }
        })
    }
}