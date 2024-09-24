const sequelize=require('../helpers/mysql.init');
const Sequelize=require('sequelize');
const activity=sequelize.define('UserActivity',{
    userEmail:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    }

},{
    timeStamps:false
})
module.exports=activity;