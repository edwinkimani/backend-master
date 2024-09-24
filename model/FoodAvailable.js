const sequelize=require('../helpers/mysql.init');
const Sequelize=require('sequelize');
const FoodAvailable=sequelize.define('FoodAvailable',{
    NameOfFood:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    Cost:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    }
})
module.exports=FoodAvailable;