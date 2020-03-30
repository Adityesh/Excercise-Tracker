const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config();
const Users = require('./models/Users');
const Excercise = require('./models/Excercise');
const moment = require('moment');

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI,{useNewUrlParser : true,useUnifiedTopology: true})



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("Connected")});

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//Create a new user
app.post('/api/exercise/new-user', async (req, res) => {
  const username = req.body.username;
  await Users.findOne({username : username},(err, document)=> {
    if(document != null) {
      res.status(400).send("username already taken")
    } else {
      let User = new Users({
        "username" : username
      })
      Users.create(User).then(doc => {
        res.json({
          username : doc.username,
          _id : doc._id
        })
      })
    }
  })
})


//Get all users
app.get('/api/exercise/users', async (req, res) => {
  let users = await Users.find({})
  res.json(users)
})


//Post an excercise to an username
app.post('/api/exercise/add', async (req, res) => {
  const {userId, description, duration, date} = req.body;
  let date1;
  if (date == null || date == undefined || date == "") {
    date1= new Date().toDateString()
  } else if (date != null || date != undefined || date != "") {
    date1 = new Date(date).toDateString()
  }
  await Users.findOne({_id : userId}, (err, doc) => {
    if(err) console.log(err);
    if(doc != null) {
      let excercise = new Excercise({
        userId : doc._id,
        username : doc.username,
        description : description,
        duration : duration,
        date : date1
      })

      Excercise.create(excercise).then((doc) => {
        let send = {
          username : doc.username,
          description : doc.description,
          duration : doc.duration,
          _id : userId,
          date : doc.date
        }
        res.status(201).json(send);
      })
    } else {
      res.status(404).json({
        Error : "Given userId not found in the database"
      })
    }
  })
})

//Get excercise log for an user
app.get('/api/exercise/log' ,async (req, res) => {
  let countNo = 0;
  let username = '';
  let arr = []
  let {userId, from, to, limit} = req.query
  await Excercise.countDocuments({userId : userId}, async (err, count) => {
    countNo = count;
  })
  if(from == undefined && to == undefined && limit == undefined) {
    await Excercise.find({userId : userId},async (err, docs) => {
      username = docs[0].username;
      arr = docs
    })
    let response = []
    arr.forEach(i => {
      response.push({
        description : i.description,
        duration : i.duration,
        date : i.date
      })
      
    })
  
    res.status(201).json({
      _id : userId,
      username : username,
      count : countNo,
      log : response
    })
  }else if(from == undefined && to == undefined && limit != undefined) {
    await Excercise.find({userId : userId},async (err, docs) => {
      username = docs[0].username;
      arr = docs
    }).limit(Number(limit))
    let response = []
    arr.forEach(i => {
      response.push({
        description : i.description,
        duration : i.duration,
        date : i.date
      })
      
    })
  
    res.status(201).json({
      _id : userId,
      username : username,
      count : countNo,
      log : response
    })
  } 
   else {
    let arr = []
    let user = ''
    await Excercise.find({userId : userId},async (err, docs) => {
      username = docs[0].username;
      arr = docs
    }).limit(Number(limit))

    let response = []
    arr.forEach(i => {
      if(new Date(i.date) >= new Date(from) && new Date(i.date) <= new Date(to)) {
      
        response.push({
          description : i.description,
          duration : i.duration,
          date : i.date
        })
        
      }
    })


    res.status(201).json({
      _id : userId,
      username : username,
      count : countNo,
      log : response
    })

  }
  

  
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
