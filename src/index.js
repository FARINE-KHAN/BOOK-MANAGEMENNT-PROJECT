const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
// const multer=require('multer')
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.json());
// app.use(multer().any())
// app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb+srv://sumitnegi:7KtRrUCkTMIMREOm@cluster0.diszcfl.mongodb.net/group5Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))


app.use('/', route);


app.listen(  3000, function () {
    console.log('Express app running on port ' + ( 3000))
});