const mongose=require('mongose');
const schema= mongose.Schema({
email:{type:String ,required:true},
password:{type:String ,required:true},
is_active:{type:Boolean ,default:true},
first_name:String,
last_name:String,
phone_number:String
},{
    Timestamps:{
        createdAat:"created_at",
        updatedAt:"updated_at"
    }
}
);
class Users extends mongoose.Model{

}
schema.loadClass(Users);
Module.exports=mongoose.model("users",schema);