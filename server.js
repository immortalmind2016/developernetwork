const express=require("express")
const app=express();
const passport=require("passport")
const mongoose=require('mongoose');
const config=require("./config/key")
const bodyParser=require("body-parser")
const users=require("./routes/api/users")
const profile=require("./routes/api/profile")
const posts=require("./routes/api/posts")
const path=require("path")
app.use(express.static(path.join(__dirname,"client/build")))
// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//passport middleware
app.use(passport.initialize())
//passport config
require("./config/passport.js")(passport)
//DB CONFIG
const db=config.mongoURI
// Connect ro mongoDb
mongoose.connect(db,{ useNewUrlParser: true }).then(()=>{
  console.log("Mongodb connected  !")
}).catch((err)=>{
 console.log(err);
})

// Use Routes
app.use("/api/users",users);
app.use("/api/profile",profile);
app.use("/api/posts",posts);
// server static assets if in production

app.get("*",(req,res)=>{
  res.sendFile(path.resolve(__dirname,"client","build","index.html"))
})

const port=process.env.PORT||5000
app.listen(port,()=>{
  console.log(`Server running on port ${port}`)
});