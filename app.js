const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req,res) => {
    res.render("index");
});

app.post('/register', async(req,res) => {
    //Sbse pehle check krenge wo user ka email already exist krta h ya nhi
    let {email, password, name, username, age} = req.body;
    let user = await userModel.findOne({email});

    if(user){
        return res.status(500).send("User already exists");
    }
    //If we dont have users with that email, then we will create a new user
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            let user = await userModel.create({
                username, //username username hi rhega
                name, //name name hi rhega
                age, //age age hi rhega
                email,
                password: hash, //password humne hash krke save krna hai
            });

            let token = jwt.sign({email: email, userid: user._id}, "secretkey");  //It gives token
            res.cookie('token', token);
            res.send("User registered successfully");
        })
    })
});

app.listen(3000);
