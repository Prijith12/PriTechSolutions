var express = require('express');
var router = express.Router();
const {render}=require('../app')
var contacthelper = require('../helpers/addcontactdetails');
var servicehelper=require('../helpers/addservicedetails');
var usersignhelper=require('../helpers/signinSignup')



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
  res.render('user/login')
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
      req.session.loggedin=true;
      req.session.user=data.user
      
      res.redirect('/')
    }else{
      res.send("Invalid Email or Password")
    }
  })
})
router.get('/logout',function(req,res){
  req.session.destroy()
  res.redirect('/')
})
module.exports = router;
