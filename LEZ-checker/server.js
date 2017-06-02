var express = require('express');
var bodyparser = require('body-parser');

// Create app
var app = express();

// Static file hosting
app.use(express.static('client'));

// Application middleware. Must be above REST endpoints
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyparser.json());

// Dummy database, replace by your own

/*var persons = [
  {
    name: 'Overdulve',
    firstname: 'Kristof'
  },
  {
    name: 'Vermeulen',
    firstname: 'Joske'
  }
];

// REST endpoints

app.get('/api/users', function (req, res) {
  res.status(200).json(persons);
});

app.post('/api/user', function (req, res) {
  console.log(req.body.firstname);
  res.status(201).json({ message: 'User created' });
});*/

// Listen. This must be below all the other code
app.listen(5000);
