const express = require("express");
const router = express.Router();
const mongoose=require("mongoose");
const passport=require("passport");


//post model
const Post=require("../../models/Post")
//Profile model
const Profile=require("../../models/Porfile")
//validation
const validatePostInput=require("../../validation/post")
const validateCommentInput=require("../../validation/comment")

// @route GET api/posts/test
// @desc tests posts route
// @access public

router.get("/test", (req, res, next) => {
  res.json();
});

// @route GET api/posts
// @desc  get all posts
// @access public
router.get("/", (req, res, next) => {

  Post.find()
  .sort({data:-1})
  .then(posts=>res.json(posts))
  .catch(err=>res.status(404).json({nopostsfound:"no posts found"}))
 
});

// @route GET api/posts/:id
// @desc Get post by id
// @access public
router.get("/:id", (req, res, next) => {

  Post.findById(req.params.id)
  .sort({data:-1})
  .then(post=>res.json(post))
  .catch(err=>res.status(404).json({nopostfound:"no post found with that ID"}))

});

// @route GET api/posts
// @desc create post
// @access private

router.post("/",passport.authenticate("jwt",{session:false}),(req,res)=>{
  const {errors,isValid}=validatePostInput(req.body);
  //check validation
  if(!isValid){
    // if any errors , send 200 with errors object
    res.status(400).json(errors)
  }
  const newPost=new Post({
    text:req.body.text,
    name:req.body.name,
    avatar:req.body.avatar,
    user:req.user.id
  })
  newPost.save().then(post=>res.json(post))
 

})


// @route DELETE api/posts/:id
// @desc delete post
// @access private

router.delete("/:id",passport.authenticate("jwt",{session:false}),(req,res)=>{
  Profile.findOne({user:req.user.id})
  .then(profile=>{
    Post.findById(req.params.id)
    .then(post=>{
      //check for post owner 
      if(post.user.toString()!==req.user.id){
        // auth status 401
        res.status(401).json({notauthorized:"user not authorized"})
      }

      // Delete
      post.remove().then(()=>res.json({success:true}))
      .catch(err=>res.status(404).json({nopostfound:"no post found with that ID"}))
  
    })
  
  })
 

})







// @route POST api/posts/like/:id
// @desc Like post
// @access private

router.post("/like/:id",passport.authenticate("jwt",{session:false}),(req,res)=>{
  Profile.findOne({user:req.user.id})
  .then(profile=>{
    Post.findById(req.params.id)
    .then(post=>{
      console.log(post.likes.filter(like=>like.user.toString()===req.user.id).length)
      if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
         res.status(400).json({alreadyliked:"user already liked this post"})
      }
      // add user id to likes array
      post.likes.unshift({user:req.user.id})
      post.save().then(post=>res.json(post));
    }).catch(err=>res.status(404).json({nopostfound:"no post found with that ID"}))
  
  })

})



// @route POST api/posts/unlike/:id
// @desc unlike post
// @access private

router.post("/unlike/:id",passport.authenticate("jwt",{session:false}),(req,res)=>{
  Profile.findOne({user:req.user.id})
  .then(profile=>{
    Post.findById(req.params.id)
    .then(post=>{
      if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
        return res.status(400).json({notliked:"user already unlike this post"})
      }
      console.log(post)
            console.log(req.user.id)
      const removeIndex=post.likes
      .map(item=>item.user.toString())
      .indexOf(req.user.id);

      //splice out of array
      post.likes.splice(removeIndex,1);
      //save
      post.save().then(post=>res.json(post))

    }).catch(err=>res.status(404).json({nopostfound:"no post found with that ID"}))
  
  })
 

})


// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access private
router.post("/comment/:id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
  
  const {errors,isValid}=validateCommentInput(req.body);
  //check validation
  if(!isValid){
    // if any errors , send 200 with errors object
    res.status(400).json(errors)
  }
  console.log(req.body)
  Post.findById(req.params.id)
 
  .then(post=>{
     console.log(post);
    const newComment={
      text:req.body.text,
      name:req.body.name,
      avatar:req.body.avatar,
      user:req.user.id
    }
    // add to comments array
    post.comments.unshift(newComment)
    //save
    post.save().then(post=>res.json(post))
  }).catch(err=>{})
})




// @route delete api/posts/comment/:id/:comment_id
// @desc delete comment from post
// @access private
router.delete("/comment/:id/:comment_id",passport.authenticate("jwt",{session:false}),(req,res,next)=>{
console.log("COMMMENT",req.params.id)
  Post.findById(req.params.id)
 
  .then(post=>{
     
    if(post.comments.filter(comment=>comment._id.toString()===req.params.comment_id).length===0){
        console.log("PPPPPPPPPPPPPPPPPP",post)
        res.status(404).json({commennotexist:"comment does not exist"})
    }

    // get remove index
    const removeIndex=post.comments
    .map(item=>item._id.toString())
    .indexOf(req.params.comment_id)
    //splice comment out of array 
    post.comments.splice(removeIndex,1)
    //save
    post.save().then(post=>res.json(post))
  }).catch(err=>{console.log(err);res.status(404).json({postnotfound:"no post found"})})
})




module.exports = router;
