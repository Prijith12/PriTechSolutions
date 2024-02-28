
const db=require('../config/connection');
const Razorpay=require('razorpay');
const {ObjectId}=require('mongodb');
const { resolve } = require('path');
const { reject } = require('promise');
var instance = new Razorpay({ key_id: 'rzp_live_wskRWjy99OdqZy', key_secret: 'fz2W7GP5mVx2WDodEdYC8M98' });

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
                        reject("Error creating the cart or to add the service");
    
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
               var result= await db.getDB().collection('servicesData').findOne({_id:Objectid});
                    servicesdetails.push({services:result,quantity:value.Quantity});
                }
            resolve({servicesdetails,emptycart:false});
           }else{
            resolve({message:'cart is empty',emptycart:true});
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
        console.log(result);
        resolve(result[0].totalamount);
    }catch{
        resolve();
    }
    })

},
orderInstance:(user,total)=>{
    return new Promise(async(resolve,reject)=>{
        var carts= await db.getDB().collection('Cart').findOne({Userid:user._id});
          db.getDB().collection('OrderCart').findOne({userId:user._id}).then((result)=>{
        instance.orders.create({
            amount: total*100,
            currency: "INR",
            receipt: ""+carts._id,
            },(err,order)=>{
                if(err){
                    resolve('error creating the instance')
                }else{
                    resolve(order);
                }
            })  
    })
    })
    
},
verifyPayment:(orderDetails,user,total)=>{
    return new Promise(async(resolve,reject)=>{
    var {createHmac,} = require('node:crypto');
    var hmac = createHmac('sha256', 'fz2W7GP5mVx2WDodEdYC8M98');
    hmac.update(orderDetails.razorpay_order_id+"|"+orderDetails.razorpay_payment_id);
   hmac=hmac.digest('hex');
    console.log(hmac);
    console.log(orderDetails.razorpay_signature);
    if(hmac==orderDetails.razorpay_signature){
        console.log(hmac);
        console.log(orderDetails.razorpay_signature);
        console.log("hmac verification successfull");
        try{
            var carts= await db.getDB().collection('Cart').findOne({Userid:user._id});
            var currentDate = new Date();
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1; 
            var year = currentDate.getFullYear();
            var formattedDate = `${month}/${day}/${year}`;
            console.log(formattedDate)

            db.getDB().collection('OrderCart').findOne({userId:user._id}).then((result)=>{
                if(result){
                    var ordersdet={
                        orders:carts.cart,
                        totalamount:total,
                        date:formattedDate
                    }
                    db.getDB().collection('OrderCart').updateOne({userId:user._id},{
                        $push:{userOrderDet:ordersdet}
                    })
                }else{
                    var data={
                        userId:user._id,
                        userName:user.Name,
                        userOrderDet:[{orders:carts.cart,totalamount:total,date:formattedDate}]
                    }
                    db.getDB().collection('OrderCart').insertOne(data);
                }
                console.log('ordercart created');
            db.getDB().collection('Cart').deleteOne({Userid:user._id})
            console.log('datas from the cart array deleted');
        }) 
        resolve();
        }catch(err){
            console.log(err);
            reject();
        }
       
        
    }else{
        console.log("hmac verification unsuccesfull")
        reject();

    }

    })
},
viewOrders: (user) => {
    return new Promise(async(resolve, reject) => {
      try {
        var result = await db.getDB().collection('OrderCart').aggregate([
          {
            $match: { userId: user._id }
          },
          {
            $unwind: '$userOrderDet'
          },
          {
            $unwind: '$userOrderDet.orders'
          },
          {
            $lookup: {
              from: 'servicesData',
              localField: 'userOrderDet.orders.Serviceid',
              foreignField: '_id',
              as: 'serviceDetails'
            }
          },
          {
            $project: {
              cartid: '$userOrderDet.orders.Serviceid',
              quantity: '$userOrderDet.orders.Quantity',
              total:'$userOrderDet.totalamount',
              serviceDetails:1
            }
          }
        ]).toArray();
    
        resolve(result);
        console.log(result)
      } catch (error) {
        reject(error);
      }
    });
  },
  viewOrdersList:(user)=>{
    return new Promise(async(resolve,reject)=>{
        var result=await db.getDB().collection('OrderCart').aggregate([
            {
                $match:{
                    
                }
            },
            {
              $unwind: '$userOrderDet'
            },
            {
              $unwind: '$userOrderDet.orders'
            },
            {
                $project:{
                    userId:'$userId',
                    name:'$userName',
                    serviceid:'$userOrderDet.orders.Serviceid',
                    quantity: '$userOrderDet.orders.Quantity',
                    total:'$userOrderDet.totalamount',
                    date:'$userOrderDet.date'
                }
            }
        ]).toArray()
        console.log(result);
        resolve(result);

    })
  } 
}