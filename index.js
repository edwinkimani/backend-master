const express= require('express');
require('./helpers/mysql.init');
require('./model/Users.model');
require('./model/roles.model');
require('./model/SecurityQuestion');
require('./model/userToken');
require('./model/dailySells');
require('./MiddleWare/delete');
require('./model/userActivity');
require('./model/dailyExpenses');
require('./model/inventory');
require('./model/FoodAvailable');
require('./model/notification');
// require('./data/default');
const sequelize=require('./helpers/mysql.init');
const cors=require('cors');
const bcrypt=require('bcrypt');
require('dotenv').config();
// const rolls = require('./model/rolls.model')(sequelize,Sequelize);
// const Users = require('./model/userRolls.model')(sequelize,Sequelize);

sequelize.sync({alert:true}).then(async()=>{
    const role=require('./model/roles.model');
    const find= await role.findOne({where:{roleName:"Administrator"}});
    if(!find){
     role.create({
         roleName:"Administrator"
     });
     role.create({
         roleName:"worker"
     });
     role.create({
         roleName:"NormalUser"
     }); 
     role.create({
         roleName:"SuperAdmin"
     }); 
    }
})
sequelize.sync({alert:true}).then(async()=>{
    const userModel=require('./model/Users.model');
    const find= await userModel.findOne({where:{Email:"edwinngila@gmail.com"}});
    if(!find){
    userModel.create({
        FirstName:"Edwin",
        SecondName:"Ngila",
        Email:"edwinngila@gmail.com",
        PhoneNumber:"0704922743",
        SecurityAnswer: await bcrypt.hash(process.env.securityAnswer,10),
        SecurityNumber:1,
        Password: await bcrypt.hash(process.env.defaultPassword,10),
        roleId:4,
     });
    }
})
sequelize.sync({alert:true}).then(async()=>{
    const security=require('./model/SecurityQuestion');
    const find= await security.findOne({where:{securityQuestion:"What was the name of your first school teacher?"}});
    if(!find){
     security.create({
        securityQuestion:"What was the name of your first school teacher?"
     });
     security.create({
        securityQuestion:"What is your grandmother’s maiden name"
     });
     security.create({
        securityQuestion:"What is your child’s nickname?"
     }); 
     security.create({
        securityQuestion:"What is the manufacturer of your first car?"
     }); 
     security.create({
        securityQuestion:"What was the name of your favorite childhood pet?"
     }); 
    }
})
const app=express();

const allowedOrigins=[process.env.allowedOrigins];
app.use(cors({
    origin:(origin,callback)=>{
        if(!origin|| allowedOrigins.includes(origin)){
            callback(null,true)
        }
        else{
            callback(new error('not allowed by cors'))
        }
    }
}));

app.use(express.json());
const usersRoute= require('./routes/Users');
const Administrator=require('./routes/Admin.routes');

require('./model/roles.model').hasMany(require('./model/Users.model'),{foreignKey:'roleId',default:3});
require('./model/Users.model').belongsTo(require('./model/roles.model'));

app.use('/users',usersRoute);
app.use('/Admin',Administrator);

app.use((req,res,next)=>{
    const err = new Error("NOT FOUND");
    err.status=404;
    next(err);
})
app.use((err,req,res,next)=>{
    res.status(err.status||500);
    res.send({
        error:{
            status:err.status ||500,
            Message:err.Message
        }
    })
})
app.listen(process.env.port ||4000,
    ()=>{
        console.log("you are now listening to http://locolhost:4000")
    }
);

