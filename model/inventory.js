const sequelize=require('../helpers/mysql.init');
const Sequelize=require('sequelize');
const inventory=sequelize.define('Inventory',{
    NameOfItem:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    Quantity:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    }
})
module.exports=inventory;