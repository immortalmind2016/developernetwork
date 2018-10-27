const validator=require("validator");
const isEmpty=require("./is-empty")
module.exports=function validateEducationInput(data){
  let errors={};


  data.school=!isEmpty(data.school)?data.school:"";
  data.degree=!isEmpty(data.degree)?data.degree:"";
  data.from=!isEmpty(data.from)?data.from:""; // turn it empty if undefined or null
  data.fieldofstudy=!isEmpty(data.fieldofstudy)?data.fieldofstudy:""; // turn it empty if undefined or null

  if(validator.isEmpty(data.school)){
     errors.school="school field is required";
  }
  if(validator.isEmpty(data.degree)){
    errors.degree="degree field is required";
  }
  if(validator.isEmpty(data.from)){
    errors.from="from date field is required";
  }
 
 if(validator.isEmpty(data.fieldofstudy)){
    errors.fieldofstudy="fieldofstudy date field is required";
  }

  return {
    errors,
    isValid:isEmpty(errors)
  }
}