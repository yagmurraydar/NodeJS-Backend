const mongoosw=require('mongoose');

const schema =mongoose.Schema({
   role_id:{type:mongoose.Schema.Types.ObjectId,required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId,required:true},
},
{
    versionKey:false,
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
}
);
    class UsersRoles extends mongoose.Model {

    }
    schema.loadClass(UsersRoles);
    Module.exports=mongoose.model("users_roles",schema);
