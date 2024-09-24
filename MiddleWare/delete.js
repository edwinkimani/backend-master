const cron = require('node-cron');
const dailySells=require('../model/dailySells');

cron.schedule('0 0 * * *',async()=>{
    try{
        await dailySells.destroy({
            where:{},
            truncate:true,
        })
     console.log('the table was cleared successfully');
    }
    catch(err){
        console.log(err)
    }
})