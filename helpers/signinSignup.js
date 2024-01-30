const db=require('../config/connection')
const bcrypt=require('bcrypt')
const {ObjectId}=require('mongodb')
var insertedid=null

module.exports={
    addSignUpDetails:async function(details,callback){
        details.Password=await bcrypt.hash(details.Password,10);
        try{
        db.getDB().collection('Users').insertOne(details).then((data)=>{
            console.log('successfully inserted the signup details');
             var objectId=new ObjectId(data.insertedId)
             insertedid=objectId
             db.getDB().collection('Users').findOne({_id:insertedid}).then((data)=>{
                callback(data)
            })
        })
        
        
        }catch(err){
            console.log('error updating the signup details'+err)
        
        }
    },
    signInValidation:function(signin,callback){
        var resultss={}
        db.getDB().collection('Users').findOne({Email:signin.Email}).then((data)=>{
            if(data){
                
                bcrypt.compare(signin.Password,data.Password).then((result)=>{
                    if(result){
                        resultss.status=true;
                        resultss.user=data;
                        callback(resultss);
                        console.log("Email and password is correct");
                    }else{
                        resultss.status=false
                        callback(resultss.status)
                        console.log("password is wrong")
                    }
                    
                })
                
            }else{
                resultss.status=false;
                callback(resultss.status);
                console.log("Email or password is wrong")
            }
        })
    }
}