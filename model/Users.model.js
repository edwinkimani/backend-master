const Sequelize= require('sequelize');
const sequelize=require('../helpers/mysql.init')
const Users = sequelize.define('users',{
    id:{
        type:Sequelize.DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    FirstName:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    SecondName:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false,
    },
    Email:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false
    },
    PhoneNumber:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false,
    },
    SecurityAnswer:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false,
    },
    SecurityNumber:{
        type:Sequelize.DataTypes.TEXT,
        allowNull:false,
    },
    Password:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    roleId:{
        type:Sequelize.DataTypes.INTEGER,
        defaultValue:3
    }   
},{
    timestamps:false
})
module.exports=Users;