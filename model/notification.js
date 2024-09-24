const sequelize=require('../helpers/mysql.init');
const Sequelize=require('sequelize');
const Notification=sequelize.define('Notification',{
    NameNotification:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    TimeOfNotification:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    }
})
module.exports=Notification;