const sequlize=require('../helpers/mysql.init');
const Sequelize=require('sequelize');
const DailyExpenses=sequlize.define("DailyExpenses",{
    Name_of_Expense:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    Cost:{
        type:Sequelize.DataTypes.INTEGER,
        allowNull:false
    }
})
module.exports=DailyExpenses;