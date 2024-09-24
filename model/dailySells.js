const Sequelize=require('sequelize');
const sequelize=require('../helpers/mysql.init');
const dailySell=sequelize.define('dailySelll',{
    quantity:{
        type:Sequelize.DataTypes.INTEGER,
        alowNull:false,
    },
    itemName:{
        type:Sequelize.DataTypes.STRING,
        alowNull:false
    },
    price:{
        type:Sequelize.DataTypes.INTEGER,
        alowNull:false
    },
    typeOfPayment:{
        type:Sequelize.DataTypes.STRING,
        alowNull:false
    }

})
module.exports=dailySell;
