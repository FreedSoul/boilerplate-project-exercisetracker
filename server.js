const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
let mongoose;
try {
  mongoose = require('mongoose')
}catch (e){
  console.log(e)
}
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_KEY, {useNewUrlParser: true, useUnifiedTopology: true}, console.log('conectado con DB'));  

//Schemas
const UserSchema = new mongoose.Schema({
  username: String
})

const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})

const LogSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: Array
})

//Models
let User = mongoose.model("user", UserSchema)
let Exercise = mongoose.model("exercise",ExerciseSchema)
let Log =  mongoose.model("log", LogSchema)

//populate db
let arrayOfClients = [{username: 'matt', duration: 28 , description:['Push-ups','Push-ups']},
{username: 'camila', duration: 21 , description:['Squats','Push-ups']},
{username: 'tadeo', duration: 29 , description:['Push-ups','Squats']},
{username: 'maria', duration: 48 , description:['Push-ups','Squats']},
{username: 'andres', duration: 38 , description:['Squats','Push-ups']}]

// User.create(arrayOfClients,function(error,data){
//     if (error) return console.log(error)
// })
// Exercise.deleteMany({},function(error,data){
//     if (error) return console.log(error)
//     else {console.log('db borrada')}
// })

app.post('/api/users', (req, res) => {
  let userToPost = req.body.username
  let idToResponse;
  let CreateOneUser = () => {
    User.create({username: userToPost},function(error, data){
      if (error) return console.log(error)
      console.log("se ha creado un nuevo usuario ", req.body.username+" "+data._id)
      res.json({
        "username": req.body.username,
        "_id": data._id
      })
    })
  }
  
  //se crea un usuario nuevo (puede ser repetido)
  //se busca en db si hay algun nombre con el input y se muestra el id
  User.findOne({username: userToPost}, '_id',(error, idNewUser) => {
    if (error) {return console.log('no se ha podido crear usuario',error)
    }
    if (idNewUser){
      console.log("ya existe "+idNewUser)
      res.json({
        "username": req.body.username,
        "_id": idNewUser._id 
      })
    }else{
      CreateOneUser(idNewUser);
    }  
  }) 
})

app.get('/api/users', (req, res) => {
  User.find({}, '_id, username',(error, data) => {
    if (error) return console.log(error)
    console.log('mostrando lista de usuarios')
    res.json(data)
  })  
})


app.post('/api/users/:_id/exercises', (req, res) => {
  let idToFind = req.params._id
  let description = req.body.description
  let duration = req.body.duration
  let date
  console.log( req.params._id+'---ID')
  console.log( req.body.date+'---fecha')
  console.log( req.body.description+'---exercise')
  console.log(req.body.duration+'---duracion')
  if (req.body.date == '' || req.body.date == undefined) {
    date = new Date()
  }else{
    if (req.body.date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/g)){
      date = new Date(req.body.date)
    }else{
      return res.send('<h3>fecha no valida<h3>')
    }
  }
  if(idToFind){
    User.findById(idToFind,(error, register) => {
      if(register == null) {
        console.log('data es null') 
        return res.send('<h3>el id no se encuentra en la base de datos intenta otro<h3>')}
      if(error){
        console.log('ha ocurrido un error en la busqueda', error)
      }else{
        const aux = new Exercise({
          "username": register.username,
          "description": req.body.description,
          "duration": parseInt(req.body.duration),
          "date": date.toDateString()
        })
        aux.save((err,confirm) => {
          if(err){
            console.log('hubo un error al guardar el nuevo registro',err)
          }else{
            console.log("sesion de ejercicio guardado existosamente")
            res.json({
              "username": confirm.username,
              "description": confirm.description,
              "duration":  confirm.duration,
              "date": confirm.date,
              "_id": idToFind
              // "_id": "62237ca171e36506d4402304",
              // "username": "matthl",
              // "date": "Fri Nov 11 2022",
              // "duration":  12,
              // "description": "ffffffff"
            })
          }
        })
      }
    })
  }else{
    res.send('<h2>debes introducir un id existente<h2>')
  }
})



app.get('/api/users/:_id/logs', (req, res) => {
  let { from, to , limit } = req.query
  let id = req.params._id
  let queryObj
  // console.log("este es el id --" + req.params.id)
  // console.log("este es el to --" + from)
  // console.log("este es el to --" + to)
  // console.log("este es el from --" + limit)
  limit = (+limit);
  console.log(req.query)
  if(limit === undefined){
    limit = 10;
  }else if( limit > 100 ) {
    limit = 100;
  }
  console.log('tipo de dato limit '+typeof limit)
  
  User.findById(id,(error, data) => {
      if(error || !data){
        console.log('ha ocurrido un error en la busqueda(logs) o data es null', error)
      }else{
        queryObj = { username: data.username }
        console.log(queryObj)

                
        Exercise.find(queryObj).limit(limit).exec((err, result) => {
                  if(err){
                    console.log('hubo un error => ', err)
                  }else{
                    let exerciseList = []
                    let queryTo = new Date(from)
                    let queryFrom = new Date(to)
                    console.log('este es from '+queryFrom.toDateString()+" este es to "+ queryTo.toDateString())
                    exerciseList = result.filter((item) => {
                      let dbDate = new Date(item.date);
                      console.log(dbDate.toDateString())
                      return ((dbDate > queryFrom) || (dbDate < queryTo))?(console.log('hola')) : item
                    }).map(item => ({"description": item.description, "duration": item.duration, "date": item.date }))
                    
                    let aux = new Log({
                      'username': data.username,
                      'count': exerciseList.length,
                      'log': exerciseList
                    })

                    aux.save((err,confirm) => {
                      if(err){
                        console.log('hubo un error al guardar el nuevo registro',err)
                      }else{
                        console.log("log guardado correctamente")
                        res.json({
                          'username': data.username,
                          'count': exerciseList.length,
                          '_id': id,
                          'log': exerciseList
                        })
                      }
                    })
                  }
                })
      }
    })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})