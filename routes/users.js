var express = require('express');
const bcrypt = require("bcrypt-nodejs");
const is = require("is_js");

const Users = require('../db/models/Users');
const Response = require("../lib/Response");
var router = express.Router();
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const UserRoles = require("../db/models/UsersRoles");
const Roles = require("../db/models/Roles");

router.get('/', async(req, res) =>{
try {
  let users = await Users.find({});
  res.json(Response.successResponse(users));
} catch (err) {
 let errorResponse = Response.errorResponse(err); 
 res.status(errorResponse.code).json(errorResponse);
}
});


router.post("/add", async(req,res)=>{
  let body = req.body;
try {

  if(!body.email)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","email is required");

  if(!is.email(body.email))
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","email is not valid");

  if(!body.password)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","password is required");

  if(body.password.length < Enum.PASS_LENGTH)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error",`password must be at least ${Enum.PASS_LENGTH} characters`);

  if(!body.roles || !Array.isArray(body.roles) || body.roles.length == 0)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","roles must be array");

  let existing = await Users.findOne({ email: body.email });
  if(existing)
    throw new CustomError(Enum.HTTP_CODES.CONFLICT,"Validation Error","email already exists");

  let roles = await Roles.find({_id:{$in:body.roles}});
  if(roles.length == 0)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","invalid roles");

  let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

  let user = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
  });

  for(let i=0;i<roles.length;i++){
    await UserRoles.create({
      user_id: user._id,
      role_id: roles[i]._id
    });
  }

  res.status(Enum.HTTP_CODES.CREATED)
     .json(Response.successResponse({success:true},Enum.HTTP_CODES.CREATED));

} catch (err) {
  let errorResponse = Response.errorResponse(err);
  res.status(errorResponse.code).json(errorResponse);
}
});



router.post("/update", async(req,res)=>{
  try {

    let body = req.body;
    let updates = {};

    if(!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","_id is required");

    if(body.password){
      if(body.password.length < Enum.PASS_LENGTH)
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error",`password must be at least ${Enum.PASS_LENGTH}`);

      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
    }

    if(typeof body.is_active == "boolean") updates.is_active = body.is_active;
    if(body.first_name) updates.first_name = body.first_name;
    if(body.last_name) updates.last_name = body.last_name;
    if(body.phone_number) updates.phone_number = body.phone_number;


    if(Array.isArray(body.roles)){

      let userRoles = await UserRoles.find({user_id:body._id});

      let currentRoleIds = userRoles.map(r => String(r.role_id));
      let newRoleIds = body.roles.map(r => String(r));

      let removedRoles = userRoles.filter(r => !newRoleIds.includes(String(r.role_id)));
      let addedRoles = newRoleIds.filter(id => !currentRoleIds.includes(id));

      if(removedRoles.length > 0){
        await UserRoles.deleteMany({_id:{$in:removedRoles.map(r=>r._id)}});
      }

      if(addedRoles.length > 0){
        for(let i=0;i<addedRoles.length;i++){
          await UserRoles.create({
            role_id: addedRoles[i],
            user_id: body._id
          });
        }
      }
    }

    await Users.updateOne({_id:body._id},updates);

    res.json(Response.successResponse({success:true}));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/delete", async(req,res)=>{
  try {

    let body = req.body;

    if(!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","_id is required");

    await Users.deleteOne({_id:body._id});
    await UserRoles.deleteMany({user_id:body._id});

    res.json(Response.successResponse({success:true}));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/register", async(req,res)=>{
  let body = req.body;
try {

  let userCount = await Users.countDocuments();
  if(userCount > 0)
    throw new CustomError(Enum.HTTP_CODES.FORBIDDEN,"System initialized","super admin already exists");

  if(!body.email)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","email is required");

  if(!is.email(body.email))
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","email is not valid");

  if(!body.password)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","password is required");

  if(body.password.length < Enum.PASS_LENGTH)
    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error",`password must be at least ${Enum.PASS_LENGTH}`);

  let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

  let createdUser = await Users.create({
    email: body.email,
    password,
    is_active: true,
    first_name: body.first_name,
    last_name: body.last_name,
    phone_number: body.phone_number
  });

  let role = await Roles.create({
    role_name: Enum.SUPER_ADMIN,
    is_active: true,
    created_by: createdUser._id
  });

  await UserRoles.create({
    role_id: role._id,
    user_id: createdUser._id
  });

  res.status(Enum.HTTP_CODES.CREATED)
     .json(Response.successResponse({success:true},Enum.HTTP_CODES.CREATED));

} catch (err) {
  let errorResponse = Response.errorResponse(err);
  res.status(errorResponse.code).json(errorResponse);
}
});

module.exports = router;
