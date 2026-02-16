const express=require("express");
const router = express.Router();

const Roles=require("../db/models/Roles");
const RolePrivileges=require("../db/models/RolePrivileges");
const Response = require("../lib/Response");
const CustomError=require("../lib/Error");
const Enum=require("../config/Enum");
const role_privileges=require("../config/role_privileges");
router.get("/", async(req,res)=>{
    try {
        
        let roles=await Roles.find({});
        res.json(Response.successResponse(roles));

    } catch (err) {
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);

    }
});
router.post("/add", async (req, res) => {
  const body = req.body;

  try {
    if (!body.role_name)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "role_name is required");

    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "permissions must be an array");

    const role = await Roles.create({
      role_name: body.role_name,
      is_active: true,
      created_by: req.user?.id || "65f1c9b1a3e2f7b8c9d0e123",
    });

    const privileges = body.permissions.map((p) => ({
      role_id: role._id,
      permission: p,
      created_by: req.user?.id,
    }));

    await RolePrivileges.insertMany(privileges);

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", async (req, res) => {
  const body = req.body;

  try {
    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "_id is required");

    const updates = {};
    if (body.role_name) updates.role_name = body.role_name;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Roles.updateOne({ _id: body._id }, updates);

    if (body.permissions && Array.isArray(body.permissions)) {
      await RolePrivileges.deleteMany({ role_id: body._id });

      const newPrivs = body.permissions.map((p) => ({
        role_id: body._id,
        permission: p,
        created_by: req.user?.id,
      }));

      await RolePrivileges.insertMany(newPrivs);
    }

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", async(req,res) => {
    let body=req.body;
    try {
        if(!body._id) throw  new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error","_id is required")
await Roles.deleteOne({_id:body._id});
         res.json(Response.successResponse({success:true}))

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
        
    }

});
router.get("/role_privileges",async(req,res)=>
{
    res.json(role_privileges);
}) 


module.exports=router;