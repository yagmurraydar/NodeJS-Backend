const mongoose=rquire('moongose');

const schema=mongoose.Schema({
role_name:{type:String,required:true},
is_active:{type:Boolean,default:true},
created_by:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,

}
},{versionKey:false,
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
}
);
class Roles extends mongoose.Model {

}
schema.loadClass(Roles);
Module.exports=mongoose.model("roles",schema);
