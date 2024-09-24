const roll=require('../model/rolls.model');

const userRolls=(async()=>{
    try{
    const find= await roll.findOne({where:{rollName:"Administrator"}});
    if(!find){
     roll.create({
         rollName:"Administrator"
     });
     roll.create({
         rollName:"worker"
     });
     roll.create({
         rollName:"NormalUser"
     }); 
    }  
    }
    catch(err){
     console.error(`this is the error message`,err);
    }
 })();
 module.exports=userRolls;

