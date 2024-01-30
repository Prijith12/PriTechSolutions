const { resolve } = require('path');
const db=require('../config/connection');
const { reject } = require('promise');
const {ObjectId}=require('mongodb')

module.exports={
    addcart: function(user,cartid){
        return new Promise((resolve,reject)=>{
            db.getDB().collection('Cart').findOne({Userid:user._id}).then((result)=>{
            
                if(result){
                    db.getDB().collection('Cart').updateOne({Userid:user._id},{
                        $push:{cart:cartid}
                    })
                    resolve("Successfully pushed the services to the cart");
                }else{
                    try{
                        var data={
                            Name:user.Name,
                            Userid:user._id,
                            cart:[cartid]
                        }
                        db.getDB().collection('Cart').insertOne(data);
                        resolve("User Cart has created and added the service");
                    }catch{
                        reject("Error creating the car or to add the service");
    
                    }
                }
            })
            
        })
        
    },
 
   viewCart: function(userid){
        return new Promise(async(resolve,reject)=>{
            try{
                var servicesdetails=[];
                var emptycart;
            var cartdetails= await db.getDB().collection('Cart').findOne({Userid:userid._id});
           if(cartdetails){
            for(const value of cartdetails.cart){
               
                var Objectid= new ObjectId(value)
               var result= await db.getDB().collection('servicesData').findOne({_id:Objectid})
                    servicesdetails.push(result);
                
            }
            resolve({servicesdetails,emptycart:false})
           }else{
            resolve({message:'cart is empty',emptycart:true})
           }
           }catch{
                reject('error')
                console.log('error viewing the cart');
            }
        })
    },
    viewCartCount: (userid)=>{
        return new Promise((resolve,reject)=>{
            db.getDB().collection('Cart').findOne({Userid:userid._id}).then((data)=>{
                if(data){
                    var carts=data.cart
                    var cartss=carts.length
                    resolve(cartss)
                }else{
                    resolve(0)
                }
            })
        })
    },
    deleteCart:(user,cartid)=>{
        return new Promise((resolve,reject)=>{
            db.getDB().collection('Cart').updateOne({Userid:user._id},{
                $pull:{cart:cartid}
             }).then((result)=>{
                console.log(result)
             })
             resolve();

         })
     
    }
    
}