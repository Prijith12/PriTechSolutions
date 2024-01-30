var express = require('express');
var router = express.Router();
const {render}=require('../app')
var contacthelper = require('../helpers/addcontactdetails');
var servicehelper=require('../helpers/addservicedetails');
var usersignhelper=require('../helpers/signinSignup')
var carthelper=require('../helpers/carthelper')
const {ObjectId}=require('mongodb')


const usrlogedchecking=function(req,res,next){
  if(req.session.logged){
    next()
  }else{
    res.redirect('/login')
  }
}

router.get('/', function(req, res, next) {
  var users=req.session.user
  var counts=0;
  if(req.session.logged){
    carthelper.viewCartCount(req.session.user).then((count)=>{
      counts=count
    })
  }
  servicehelper.viewservices().then(function(cardss){
    res.render('user/index', { title: 'Express',cardss,admin:false,users,counts});

  }).catch((err)=>{
    console.log(err)
  })
  
});
router.post('/consub',function(req,res){
console.log(req.body)
contacthelper.addContact(req.body);
res.send('successfully submitted the details')
})
router.get('/login',(req,res)=>{
  if(req.session.logged){
    res.redirect('/')
  }else{
    if(req.session.invaliduser){
      res.render('user/login',{invalidusr:true})
      req.session.invaliduser=false;

    
    }else{
      res.render('user/login',{invalidusr:false})
    }
  
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signupsav',(req,res)=>{
  
  usersignhelper.addSignUpDetails(req.body,function(data){
  if(data){
    console.log(data)
    req.session.user=data
    req.session.logged=true
    res.redirect('/')
  }else{
    res.send("error")
    console.log('error')
  }
  })
})

router.post('/loginValidation',(req,res)=>{
  usersignhelper.signInValidation(req.body,function(data){
    if(data.status){
      req.session.logged=true
      req.session.user=data.user;
            
      res.redirect('/')
    }else{  
      req.session.invaliduser=true;
      res.redirect('/login')
    }
  })
})
router.get('/logout',function(req,res){
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',usrlogedchecking,(req,res)=>{
  carthelper.viewCart(req.session.user).then((data)=>{
    var users=req.session.user;
    res.render('user/cart',{data,users,admin:false})
   
  })
 
})

router.get('/home',(req,res)=>{
  res.redirect('/')
})
router.get('/serviceadd',usrlogedchecking,function(req,res){
  
  console.log(req.query.id)
  console.log(req.session.user)
  carthelper.addcart(req.session.user,req.query.id).then((data)=>{
    console.log(data)
  })
 
  res.redirect('/')
})
router.get('/deleteCart',(req,res)=>{
  carthelper.deleteCart(req.session.user,req.query.id).then(()=>{
    res.redirect('/cart')
  })
})
module.exports = router;
