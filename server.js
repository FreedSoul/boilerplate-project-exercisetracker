const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users/:username', (req, res) => {
  res.json({
      username:  req.body.username,
      _id: //id de la conexion con mongo
  })
})

app.get('/api/users', (req,res) => {
  res.json({
    //mostrar todo los usuario registrados en un array
    //[{user,_id},{},{},{},]
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  res.json({
      username:  req.body.username,
      _id: //id de la conexion con mongo
    // will be the user object with the exercise fields added.
  })
})

app.get('/api/users/:_id/exercises', (req,res) => {
  res.json({
    //devolver un log de cualquier id de usuario
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  // user{count excercises per user}
})

app.get('/api/users/:id/logs', (req, res) => {
  // user {log[excercises, description(string),duration(number),date(string*dateString method*)]}
})

//last point go read



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})