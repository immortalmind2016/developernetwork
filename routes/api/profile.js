const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
//load profile Model
const Profile = require("../../models/Porfile");
//loader User profile
const User = require("../../models/User");
//load validation 
const validateProfileInput=require("../../validation/profile")
const validateExperienceInput=require("../../validation/experience")
const validateEducationInput=require("../../validation/education")

// @route GET api/profile/test
// @desc Tests profile route
// @access public

router.get("/test", (req, res, next) => {
  res.json();
});


// @route GET api/profile
// @desc Tget Current users profile
// @access Private
router.get("/",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  let errors={};
  Profile.findOne({user:req.user.id})
  .populate("user",["name","avatar"])
  .then(profile=>{
    if(!profile){
      errors.noprofile="there's no profile for this user"
      return res.status(404).json(errors)
    }
    res.json(profile);
  })
  .catch(err=>res.status(404).json(err))
})


// @route GET api/profile/all
// @desc  get all profiles
// @access public
 router.get("/all",(req,res,next)=>{
   let error={};
   Profile.find()
   .populate("user",["name","avatar"])
   .then(profiles=>{
     if(!profiles){
      errors.noprofile="there's no profiles"
       return res.status(404).json(errors);
     }
     console.log(profiles)
     res.json(profiles);
   }).catch(err=>res.status(404).json({profiles:"there's no profiles"}))
 })

// @route GET api/handle/:handle
// @desc  get profile by handle
// @access public
router.get("/handle/:handle",(req,res,next)=>{
  let errors={};
  Profile.findOne({handle:req.params.handle})
  .populate("user",["name","avatar"])
  .then((profile)=>{
    if(!profile){
      errors.noprofile="There is no profile for this user";
      res.status(404).json(errors); // not found error
    }
    res.json(profile)

  })
  .catch(err=>res.status(404).json(err))
});



// @route POST api/user/:user_id
// @desc  get profile by user id
// @access public
router.get("/user/:user_id",(req,res,next)=>{
  let errors={};
  Profile.findOne({user:req.params.user_id})
  .populate("user",["name","avatar"])
  .then((profile)=>{
    if(!profile){
      errors.noprofile="There is no profile for this user";
      res.status(404).json(errors); // not found error
    }
    res.json(profile)
  })
  .catch(err=>res.status(404).json({profile:"there is no profile for this user"}))
});


// @route POST api/profile
// @desc  Create or edit users profile
// @access Private
router.post("/",passport.authenticate("jwt",{session:false}),(req,res,next)=>{

  const {errors,isValid}=validateProfileInput(req.body);
  //check validation 
  if(!isValid){
    //return any errors
    res.status(400).json(errors);
  }

  //Get fields
  const profileFields={}
  profileFields.user=req.user.id
  if(req.body.handle) profileFields.handle=req.body.handle
  if(req.body.company) profileFields.company=req.body.company
  if(req.body.bio) profileFields.bio=req.body.bio

  if(req.body.website) profileFields.website=req.body.website
  if(req.body.location) profileFields.location=req.body.location
  if(req.body.status) profileFields.status=req.body.status
  if(req.body.githubusername) profileFields.githubusername=req.body.githubusername
  // skills - split into array
  if(typeof(req.body.skills) !=="undefined"){
    profileFields.skills=req.body.skills.split(",")
  }
  //social
  profileFields.social={};
  if(req.body.youtube) profileFields.social.youtube=req.body.youtube
  if(req.body.facebook) profileFields.social.facebook=req.body.facebook
  if(req.body.linkedin) profileFields.social.linkedin=req.body.linkedin
  if(req.body.twitter) profileFields.social.twitter=req.body.twitter
  if(req.body.instagram) profileFields.social.instagram=req.body.instagram
  if(req.body.facebook) profileFields.social.facebook=req.body.facebook

 Profile.findOne({user:req.user.id},(err,profile)=>{
   if(profile){
     //update
     Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true}).then((prof)=>{
      console.log("IF",prof)
        return res.json(prof)
     }).catch(err=>console.log(err));
   }else{
     //create
       console.log("ELSE")
     //check if handle exists
     Profile.findOne({handle:profileFields.handle},(err,profile)=>{
       if(profile){
         errors.handle="that handle already exists"
         return res.status(400).json(errors)
       }

       //Save Profile
       new Profile(profileFields).save().then(profile=>res.json(profile))
     })
   }
 })

})

// @route POST api/profile/experience
// @desc  add experience to profile
// @access Private

router.post("/experience",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
    const {errors,isValid}=validateExperienceInput(req.body);

  //check validation 
  if(!isValid){
    //return any errors
 
    res.status(400).json(errors);
  }
  Profile.findOne({user:req.user.id})
  .then(profile=>{
    const newExp={
      title:req.body.title,
      company:req.body.company,
      location:req.body.location,
      from:req.body.from,
      to:req.body.to,
      current:req.body.current,
      description:req.body.description
    }
    // add to exp array
    profile.experience.unshift(newExp); // add to front of array
    profile.save().then((profile)=>res.json(profile))
  })
})



// @route DELETE api/profile/experince/:exp_id
// @desc  Delete experince from profile
// @access Private
 router.delete("/experience/:exp_id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  console.log("DELETE")
  
  Profile.findOne({user:req.user.id}).then((profile)=>{
      //Get remove index
      console.log(req.params.exp_id)
      const removeIndex=profile.experience
      .map(item=> item.id)
      .indexOf(req.params.exp_id);

      //splice out of array
      profile.experience.splice(removeIndex,1);
      //save
      profile.save().then(profile=>res.json(profile))

  })
  .catch(err=>res.status(404).json(err));

 })

// @route DELETE api/profile/education/:educ_id
// @desc  Delete education from profile
// @access Private
 router.delete("/education/:educ_id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  Profile.findOne({user:req.user.id}).then((profile)=>{
      //Get remove index
      console.log(req.params.exp_id)
      const removeIndex=profile.education
      .map(item=> item.id)
      .indexOf(req.params.exp_id);

      //splice out of array
      profile.education.splice(removeIndex,1);
      //save
      profile.save().then(profile=>res.json(profile))

  })
  .catch(err=>res.status(404).json(err));
 })



// @route POST api/profile/education
// @desc  add education to profile
// @access Private

router.post("/education",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
    const {errors,isValid}=validateEducationInput(req.body);

  //check validation 
  if(!isValid){
    //return any errors
    console.log(isValid)
    res.status(400).json(errors);
  }
  Profile.findOne({user:req.user.id})
  .then(profile=>{
    const newEdu={
      school:req.body.school,
      degree:req.body.degree,
      fieldofstudy:req.body.fieldofstudy,
      from:req.body.from,
      to:req.body.to,
      current:req.body.current,
      description:req.body.description
    }
    // add to exp array
    profile.education.unshift(newEdu); // add to front of array
    profile.save().then((profile)=>res.json(profile))
  })
})




// @route DELETE api/profile
// @desc  Delete user and profile
// @access Private
 router.delete("/",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  Profile.findOneAndRemove({user:req.user.id}).then(()=>{
      User.findByIdAndRemove(req.user.id)
      .then(()=>{
        res.json({success:true})
      })
  })
  .catch(err=>res.status(404).json(err));
 })



module.exports = router;
