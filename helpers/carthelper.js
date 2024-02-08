
const db=require('../config/connection');

const {ObjectId}=require('mongodb')

module.exports={
    addcart: function(user,cartid){
        var serviceObj={
            Serviceid:cartid,
            Quantity:1
        }
        return new Promise((resolve,reject)=>{
            db.getDB().collection('Cart').findOne({Userid:user._id}).then((result)=>{
            if(result){
                var serviceExist=result.cart.findIndex(service=>service.Serviceid==cartid)
                if(serviceExist!=-1){
                    db.getDB().collection('Cart').updateOne({'Userid':user._id,'cart.Serviceid':cartid},
                        {$inc:{'cart.$.Quantity':1}})
                        resolve('Successfully incremented the count')
                }else{
                    db.getDB().collection('Cart').updateOne({Userid:user._id},{
                        $push:{cart:serviceObj}
                    })
                    resolve("Successfully pushed the services to the cart");
                }
                }else{
                    try{
                        var data={
                            Name:user.Name,
                            Userid:user._id,
                            cart:[serviceObj]
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
               
                var Objectid=new ObjectId(value.Serviceid)
               var result= await db.getDB().collection('servicesData').findOne({_id:Objectid})
                    servicesdetails.push({services:result,quantity:value.Quantity});
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
                $pull:{
                    cart:{
                        Serviceid:cartid
                    }
                }
            
             }).then((result)=>{
             })
             resolve();

         })
     
    },
    incrementCart:(user,cartid)=>{
        return new Promise((resolve,reject)=>{
            try{
            db.getDB().collection('Cart').updateOne({'Userid':user._id,'cart.Serviceid':cartid},{
                $inc:{'cart.$.Quantity':1}
            })
            resolve()
        }catch{
            reject()
        }
        })
    },
    decrementCart:(user,cartid)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const result = await db.getDB().collection('Cart').aggregate([
                    {
                        $match: {
                            Userid: user._id,
                            'cart.Serviceid': cartid
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            cart: {
                                $filter: {
                                    input: '$cart',
                                    as: 'item',
                                    cond: { $eq: ['$$item.Serviceid', cartid] }
                                }
                            }
                        }
                    }
                ]).toArray();
                if(result[0].cart[0].Quantity==1){
                    db.getDB().collection('Cart').updateOne({Userid:user._id},{
                        $pull:{
                            cart:{
                                Serviceid:cartid
                            }
                        }
                    
                     })
                     resolve();
                }else{
            db.getDB().collection('Cart').updateOne({'Userid':user._id,'cart.Serviceid':cartid},{
                $inc:{'cart.$.Quantity':-1}
            })
            resolve()
        }
        }catch{
            reject()
        }
        })
    },

TotalCost: (user)=>{
    return new Promise(async(resolve,reject)=>{
        try{
        var result=await db.getDB().collection('Cart').aggregate([
            {
                $match:{Userid:user._id}
            },
            {
                $unwind:'$cart'
            },
            {
                $project:{
                    cartid: { $convert: { input: '$cart.Serviceid', to: 'objectId' } },
                    quantity:'$cart.Quantity'
                }
            },
            {
                $lookup:{
                    from:'servicesData',
                    localField:'cartid',
                    foreignField:'_id',
                    as:'products'
                },
                
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    'quantity':1,
                    'products':1,
                    totalcost:{$multiply:['$quantity',{$toDouble:'$products.price'}]}
                }
            },
            {
                $group:{
                    _id:null,
                    totalamount:{$sum:'$totalcost'}
                }
            }
            
            
        ]).toArray()
        resolve(result[0].totalamount);
    }catch{
        reject("Failed to load the totalcost");
    }
    })

}
    
}