var express = require('express');
var router = express.Router();
const {render}=require('../app')
var contacthelper = require('../helpers/addcontactdetails');


/* GET home page. */
var cardss=[
  {
  image:'https://i.redd.it/2o648aerezg51.png',
  titles:'Static Web Site',
  texts:'This service provides a static web application using HTML, CSS,JS'
},
{
  image:'https://www.tesronwebtech.com/images/img/static.jpg',
  titles:'Responsive Static Web Site',
  texts:'This service provides a responsive web application using HTML, CSS,JS,Bootstrap'
},
{
  image:'https://th.bing.com/th/id/R.a0554f2778fde4673d547828ea5e7642?rik=HH0qiWGFMyosHA&riu=http%3a%2f%2fwww.eworker.co%2fcourses%2fwp-content%2fuploads%2f2017%2f09%2fcourse-nodejs-mongo-db2.png&ehk=JTWpYW7b1p1Kb0V0%2fQE824pn9rwXhdjiBQPyhbMOYsg%3d&risl=&pid=ImgRaw&r=0',
  titles:'Full stack web application',
  texts:'This service provides a full stack application using Nodejs Express and MongoDB database'
}
]
router.get('/', function(req, res, next) {
  res.render('user/index', { title: 'Express',cardss,admin:false });
});
router.post('/consub',function(req,res){
console.log(req.body)
contacthelper.addContact(req.body);
res.send('successfully submitted the details')
})

module.exports = router;
