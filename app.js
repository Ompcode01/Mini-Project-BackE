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

app.get('/login', (req,res) => {
    res.render("login");
});

app.get('/logout', (req,res) => {
    res.cookie('token', '');
    res.redirect("/login");
});

//Maanlo ye Profile ek protected Route hai
//Ye tbhi khulna chahhiye jb user login ho
app.get('/profile', isLoggedIn, async(req,res) => {
    //console.log(req.user); //Ye req.user me wo data hoga jo token me tha
    //Profile pe kon login hai wo dekhne ke liye
   let user = await userModel.findOne({email: req.user.email}).populate("posts");
   //post show krna hai  .populate() -> after findOne
   res.render('profile', {user}); // User ko profile page pe bhej diya
})

app.get('/like/:id', isLoggedIn, async(req,res) => {
    //Profile pe kon login hai wo dekhne ke liye
   let post = await postModel.findOne({_id: req.params.id}).populate("user");  //postModel bcz humko post se related kaam krna hai na 
   
   if(post.likes.indexOf(req.user.userid) === -1){
    post.likes.push(req.user.userid); //like push krdenge req.user.id ke through bcz user loggedin hai humare paas uska data hai
   }
   else{
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);  //splice means hatao  -> kitna hatao 1
   }

   await post.save();
   res.redirect('/profile'); // User ko profile page pe bhej diya
});

app.get('/edit/:id', isLoggedIn, async(req,res) => {
    // Pehle post dhundhna padega isliye pehle post dhundha hai
   let post = await postModel.findOne({_id: req.params.id}).populate("user");  //postModel bcz humko post se related kaam krna hai na 
   
    res.render("edit", {post});  //post ka deta bhejenge taaki waha pe apna current post dikhe
});

app.post('/update/:id', isLoggedIn, async(req,res) => {
   let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});  //Humko content ko update krna hai 
    res.redirect("/profile");
});

// Creater post tbhi kr payega jb wo LoggedIn ho
app.post('/post', isLoggedIn, async(req,res) => {
   let user = await userModel.findOne({email: req.user.email});
   let {content} = req.body;

   let post = await postModel.create({
    user: user._id,
    content
   });
   user.posts.push(post._id);
   await user.save();
   res.redirect('/profile');
})

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

app.post('/login', async(req,res) => {
    //Sbse pehle check krenge wo user ka email already exist krta h ya nhi
    let {email, password} = req.body;
    let user = await userModel.findOne({email});

    if(!user){
        return res.status(500).send("User does not exist");
    }
    
    //If user exists, we will compare the password
    bcrypt.compare(password, user.password, (err,result) => { //new password (jo abhi user enter krega) , old password (jo user ka db me store hai, i.e after creation)
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "secretkey");  //It gives token
            res.cookie('token', token);
            res.status(200).redirect("/profile");
        }
        else res.redirect('/login');
    })
});

// Login, Logout, Register krliya 
// AB humme Middleware chaiye, protected route ke liye
function isLoggedIn(req, res, next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "secretkey");
        req.user = data;
        next();
    }
    
}

app.listen(3000);
