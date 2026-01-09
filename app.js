 if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}







const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");




const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const aiRoutes = require("./routes/ai.js");




const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust1";

// const dbUrl = process.env.ATLASDB_URL;

main()
   .then( () =>{
    console.log("connected to DB");
   })
    .catch((err) =>{
        console.log(err);
    });


async function main(){
    // await mongoose.connect(dbUrl);
        await mongoose.connect(MONGO_URL);

}

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs' , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

app.use(express.json());
app.use("/ai", aiRoutes);



// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto : {
//         secret : process.env.SECRET,
//     },
//     touchAfter : 24 * 3600,
// })


// store.on("error" , () =>{
//     console.log("ERROR IN MONGO SESSION STORE" , err);
// })



// store.on("error", function (err) {
//     console.log("ERROR IN MONGO SESSION STORE", err);
// });



const sessionOptions = {
    // store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,         
        maxAge: 1000 * 60 * 60 * 24 * 7,  
        httpOnly: true,
    },
};

// app.get("/" , (req , res) =>{
//     res.send("Hi . I am root");
// })






app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req , res , next) =>{
    res.locals.success = req.flash("success");
    // console.log( res.locals.success);
    res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
    next();
});



app.use("/listings" , listingRouter );
app.use("/listings/:id/reviews" , reviewRouter );
app.use("/" , userRouter);










app.use((req, res) => {
    return res.status(404).render("error.ejs", { message: "Page not found" });
});

//  app.use((req, res) => {
//     res.status(404).send("Page not found");
// });




app.use((err , req , res , next) =>{
    // console.error(err); 
    let{statusCode = 500 , message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs" , {message});
})








app.listen(8080 , () =>{
    console.log("server is listening to port 8080");
});




