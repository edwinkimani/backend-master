const sequelize= require('sequelize');
const Sequelize=require('../helpers/mysql.init');
const UserToken=Sequelize.define('UserToken',{
    id:{
        type:sequelize.DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    userId:{
        type:sequelize.DataTypes.INTEGER,
        allowNull:false
    },
    token:{
        type:sequelize.DataTypes.STRING,
        allowNull:false
    },
    createdAt:{
        type:sequelize.DataTypes.DATE,
        defaultValue:sequelize.literal('CURRENT_TIMESTAMP'),
        expires:30*86400
    }
},{
    timestamps:false
});
module.exports=UserToken;