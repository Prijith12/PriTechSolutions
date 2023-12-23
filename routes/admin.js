var express = require('express');
var router = express.Router();
var servicehelper=require('../helpers/addservicedetails')
var conhelper=require('../helpers/addcontactdetails')


router.get('/login', function(req, res, next) {
  res.render('admin/adminlogin',{title:'admin'})
});
router.post('/adminvalidation',function(req,res){
console.log(req.body);
if(req.body.username==='prijitht4@gmail.com'&& req.body.password==='1111'){
  servicehelper.viewservices().then(function(cardss){
    res.render('admin/adminpaget', { title: 'Express',cardss,admin:true });

  }).catch((err)=>{
    console.log(err)
  })
}else{
  res.send("Invalid username or password")
}
})
router.get('/addservice',function(req,res){
  res.render('admin/addservices',{admin:true})
})
router.post('/servicesAdd',function(req,res){
  servicehelper.addservices(req.body,function(datas){
    var immage=req.files.image
    immage.mv('./public/service-images/'+datas+'.jpg',function(err,done){
      if(!err){
        res.render('admin/addservices',{admin:true}) 

      }else{
        console.log(err)
      }
    })
    
    
  })
 
})
router.get('/contactusview',function(req,res){
  conhelper.viewcontact().then((condetailss)=>{
   
    res.render('admin/contactusview',{admin:true,condetailss})
  }).catch((err)=>{
    console.log(err)
  })
  
})


module.exports = router;
