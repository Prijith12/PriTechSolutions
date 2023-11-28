var express = require('express');
var router = express.Router();
router.get('/',function(req,res){
    res.render('adminlogin',{title:"Admin"})
})
module.exports=router;