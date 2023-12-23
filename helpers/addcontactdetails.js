var db=require('../config/connection')
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
}

    
}
