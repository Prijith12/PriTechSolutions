var express = require('express');
var router = express.Router();
const { render } = require('../app')
var contacthelper = require('../helpers/addcontactdetails');
var servicehelper = require('../helpers/addservicedetails');
var usersignhelper = require('../helpers/signinSignup')
var carthelper = require('../helpers/carthelper')
const { ObjectId } = require('mongodb')


const usrlogedchecking = function (req, res, next) {
  if (req.session.logged) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', async function (req, res, next) {
  var users = req.session.user
  if (req.session.logged) {
    var counts = await carthelper.viewCartCount(req.session.user)
    req.session.count = counts;
  }
  servicehelper.viewservices().then(function (cardss) {
    res.render('user/index', { title: 'Express', cardss, admin: false, users, counts,viewOrder:req.session.logged });

  }).catch((err) => {
    console.log(err)
  })

});
router.get('/pritech', (req, res) => {
  res.redirect('/')
})
router.post('/consub', function (req, res) {
  console.log(req.body)
  contacthelper.addContact(req.body);
  res.send('successfully submitted the details')
})
router.get('/login', (req, res) => {
  if (req.session.logged) {
    res.redirect('/')
  } else {
    if (req.session.invaliduser) {
      res.render('user/login', { invalidusr: true })
      req.session.invaliduser = false;


    } else {
      res.render('user/login', { invalidusr: false })
    }

  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signupsav', (req, res) => {

  usersignhelper.addSignUpDetails(req.body, function (data) {
    if (data) {
      console.log(data)
      req.session.user = data
      req.session.logged = true
      res.redirect('/')
    } else {
      res.send("error")
      console.log('error')
    }
  })
})

router.post('/loginValidation', (req, res) => {
  usersignhelper.signInValidation(req.body, function (data) {
    if (data.status) {
      req.session.logged = true
      req.session.user = data.user;

      res.redirect('/')
    } else {
      req.session.invaliduser = true;
      res.redirect('/login')
    }
  })
})
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', usrlogedchecking, (req, res) => {
  carthelper.viewCart(req.session.user).then(async (data) => {
    var users = req.session.user;
    var counts = await carthelper.viewCartCount(req.session.user)
    var total = await carthelper.TotalCost(req.session.user);
    res.render('user/cart', { data, users, counts, admin: false, total })

  }).catch((data) => {
    console.log(data)
  })

})

router.get('/home', (req, res) => {
  res.redirect('/')
})
router.get('/serviceadd', usrlogedchecking, function (req, res) {
if(req.query.id=='65df4fb0e6bff72d01136bfe'){
res.render('user/referalCode');
}else{
  console.log(req.query.id)
  console.log(req.session.user)
  carthelper.addcart(req.session.user, req.query.id).then((data) => {
    console.log(data)
  })

  res.redirect('/')
}

})

router.get('/deleteCart', (req, res) => {
  carthelper.deleteCart(req.session.user, req.query.id).then(() => {
    res.redirect('/cart')
  })
})

router.get('/incrementSer', (req, res) => {
  carthelper.incrementCart(req.session.user, req.query.id).then(() => {
    res.redirect('/cart');
  }).catch(() => {
    res.send('error incrementing the Quantity')
  })
})

router.get('/decrementSer', (req, res) => {
  carthelper.decrementCart(req.session.user, req.query.id).then(() => {
    res.redirect('/cart')
  }).catch(() => {
    res.redirect('/cart');
  })
})

router.get('/placeOrder', usrlogedchecking, (req, res) => {
  carthelper.TotalCost(req.session.user).then(async (totalcost) => {
    req.session.totalcost=totalcost;
    var counts = await carthelper.viewCartCount(req.session.user);
    req.session.counts=counts;
    res.render('user/placeorder', { users: req.session.user, counts, admin: false, total: totalcost, invalid: req.session.invalid });
    req.session.invalid = false;
  })
})
router.post('/paymentproc', (req, res) => {
  console.log(req.body)
  req.session.total=req.body.total;
  if (req.body['payment-method']) {
    carthelper.orderInstance(req.session.user, req.body.total).then((data) => {
      res.json(data);
      console.log(data);
    })
  } else {
    res.json('error');
  }
})
router.post('/verifyPayment',(req,res)=>{
  console.log(req.body);
  carthelper.verifyPayment(req.body,req.session.user,req.session.total).then(()=>{
    console.log('payment successfully');
    res.json({status:true});
  }).catch(()=>{
    console.log('reject worked');
    res.json({status:false});
  })
})
router.get('/orders',(req,res)=>{
  res.render('user/order',{ users: req.session.user,admin: false});
})
router.get('/viewOrders',(req,res)=>{
  carthelper.viewOrders(req.session.user).then(()=>{
    res.send('order called');
  }).catch((err)=>{
    res.send(err+"error viewing the orders")
  })
})
router.get('/ordrs',(req,res)=>{
  res.redirect('/viewOrders')
})
router.get('/viewOrdersList',(req,res)=>{
  carthelper.viewOrdersList(req.session.user).then((orders)=>{
    res.render('admin/adminOrders',{orders:orders});
  })
})
router.get('/referal',(req,res)=>{
  if(req.query.referal=='REP9037RIJ'){
    carthelper.addcart(req.session.user, req.query.id).then((data) => {
      console.log(data)
    })
  
    res.redirect('/')
  }else{
    res.send('Please enter a valid referal code')
  }
 
})
module.exports = router;
