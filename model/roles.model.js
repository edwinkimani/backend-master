const Sequelize=require('sequelize');
const sequelize=require('../helpers/mysql.init');
const roll=sequelize.define('role',{
    id:{
        type:Sequelize.DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    roleName:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:false
});
module.exports=roll;