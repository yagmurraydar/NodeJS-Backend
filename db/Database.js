const mongoose=require('mongoose');
let instance=null;
class Database{
constructor(){
if(!instance){
    instance=this;
}
return instance;
}
async connect(options){
    try{
        console.log("Connecting...");
        let db=await mongoose.connect(options.CONNECTION_STRING, {
            
        });
        this.mongoConnection=db;
        console.log("Connected");
    }catch(err){
        console.error("Error connecting to database:", err);
        process.exit(1);
    }
}
}
module.exports=Database;