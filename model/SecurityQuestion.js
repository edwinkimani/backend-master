const Sequelize= require("sequelize");
const sequelize=require("../helpers/mysql.init");
const securityQuestions= sequelize.define('securityQustion',{
    id:{
        type:Sequelize.DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    securityQuestion:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false
    }
},{
    timestamps:false
})
module.exports=securityQuestions;