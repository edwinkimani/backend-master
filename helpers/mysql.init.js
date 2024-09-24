const { promise } = require('bcrypt/promises');
const Sequelize=require('sequelize');
require('dotenv').config();
const connection = new Sequelize(
    "Jiranis",
    "root",
    "",{
    dialect:"mysql"
});
connection.authenticate().then(
  ()=>{
    console.log("the connection was successful")
  }
).catch(
    async(err)=>{
        console.error(`this is the err`,err)
    }
)
module.exports=connection