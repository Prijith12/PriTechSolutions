var express = require('express');
var router = express.Router();
var servicehelper=require('../helpers/addservicedetails')
var conhelper=require('../helpers/addcontactdetails')


router.get('/login', function(req, res, next) {
  res.render('admin/adminlogin',{title:'admin'})
});
router.post('/adminvalidation',function(req,res){
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
router.get('/dltcontact',(req,res)=>{
  conhelper.deleteContact(req.query.id).then((data)=>{
     conhelper.viewcontact().then((condetailss)=>{
   
      res.render('admin/contactusview',{admin:true,condetailss})
    }).catch((err)=>{
      console.log(err)
    })
    console.log(data)
  }).catch((err)=>{
    res.send('error deleting the data')
    console.log(err)
  })
  
})
router.get('/editservice',(req,res)=>{
  servicehelper.viewOneService(req.query.id).then((data)=>{
    res.render('admin/editservices',{product:data})
  }).catch((err)=>{
    console.log(err)
  })
  
})
router.post('/edit',function(req,res){
  servicehelper.editService(req.body,req.query.id).then((data)=>{
    servicehelper.viewservices().then(function(cardss){
      res.render('admin/adminpaget', { title: 'Express',cardss,admin:true });
      if(req.files.image){
        var Image=req.files.image
        Image.mv('./public/service-images/'+req.query.id+'.jpg',function(err,done){
          if(!err){
            console.log("successfully editted the image") 
    
          }else{
            console.log(err)
          }
        })
      }
  
    }).catch((err)=>{
      console.log(err)
    })
    console.log(data)
  }).catch((data)=>{
    res.send("error editing the services")
    console.log(data)
  })
  
})


module.exports = router;
