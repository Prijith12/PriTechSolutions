var express = require('express');
var router = express.Router();
const {render}=require('../app')
var contacthelper = require('../helpers/addcontactdetails');
var servicehelper=require('../helpers/addservicedetails');
var usersignhelper=require('../helpers/signinSignup')


const usrlogedchecking=function(req,res,next){
  if(req.session.logged){
    next()
  }else{
    res.redirect('/login')
  }
}

router.get('/', function(req, res, next) {
  let users=req.session.user
  servicehelper.viewservices().then(function(cardss){
    res.render('user/index', { title: 'Express',cardss,admin:false,users });

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
    res.redirect('/login')
  }else{
    res.send("error")
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
  res.render('user/cart')
})

router.get('/home',(req,res)=>{
  res.redirect('/')
})
router.get('/serviceadd',usrlogedchecking,function(req,res){
  res.send('Added to the cart')
})
module.exports = router;
