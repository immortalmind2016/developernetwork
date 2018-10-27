  const express=require("express");
  const router=express.Router();
  const gravatar=require("gravatar");
  const bcrypt=require("bcryptjs");
  const jwt=require("jsonwebtoken")
  const keys=require("../../config/key")
  const passport=require("passport")
  const validateRegisterInput=require("../../validation/register")
    const validateLoginInput=require("../../validation/login")

//load user model
const User=require("../../models/User")
  // @route GET api/users/test
  // @desc tests userts route
  // @access public

  router.get("/test",(req,res,next)=>{
    res.json({msg:"USERS WORKS"});
  });
  router.post("/register",(req,res,next)=>{
    const {errors,isValid}=validateRegisterInput(req.body)
    // check validation
    if(!isValid){
      return res.status(400).json(errors)
    }
    User.findOne({email:req.body.email}).then((user)=>{
      if(user){
        return res.status(400).json({email:"Email already exists"})
      }else{
        const avatar=gravatar.url(req.body.email,{
          s:"200", //Size
          r:"pg", //Rating
          d:"mm", // Default
        })
        const newUser=new User({
          name:req.body.name,
          email:req.body.email,
          avatar,
          password:req.body.password
        });
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            console.log(hash)
            if(err) throw err;
            newUser.password=hash;
            newUser.save().then((user)=>{
              return res.json(user)
            })
            .catch(err=>{console.log(err)})
          })
        })
      }
    })

  })
// @route GET api/users/login
// @desc login user / return JWT token
// @access public
router.post("/login",(req,res)=>{
  const email=req.body.email;
  const password=req.body.password;
 const {errors,isValid}=validateLoginInput(req.body)
    // check validation
    if(!isValid){
      return res.status(400).json(errors)
    }
  //Find User by email
  User.findOne({email}).then((user)=>{
    if(!user){
      return res.status(400).json({email:"user not found"})
    }
    //check password
    bcrypt.compare(password,user.password).then((isMatch)=>{
      if(isMatch){
        //res.json({msg:"sucess"})
        //user matched
        const payload={  // create jwt payload
          id:user.id,
          name:user.name,
          avatar:user.avatar
        } 

        //sign token
        jwt.sign(payload,keys.secretOrKey,{expiresIn:3600},(err,token)=>{
          res.json({
            sucess:true,
            token:"Bearer "+token
          })
        });  //3600seconds = 1hour

      }else{
        return res.status(400).json({password:"password incorrect"})
      }
    })
  })
})

// @route GET api/users/current
// @desc return currernt user
// @access private
router.get("/current",passport.authenticate("jwt",{session:false}),(req,res)=>{

  console.log(req.user)
  res.json({
    id:req.user.id,
    name:req.user.name,
    email:req.user.email
  })
});
module.exports=router