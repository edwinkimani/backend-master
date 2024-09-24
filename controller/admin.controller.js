const modules=require('../model/dailySells');
const usersTB=require('../model/Users.model');
const inventory=require('../model/inventory');
const httpError=require('http-errors');
const DailyExpenses=require('../model/dailyExpenses');
const FoodAvailable = require('../model/FoodAvailable');
const notification=require('../model/notification');
const { Sequelize } = require('sequelize');
module.exports={
    itemsSold:async(req,res,next)=>{
        const{data,methodOfPay}=req.body;
        try {
           if(!data||!methodOfPay) throw httpError.Conflict(res.send({
            message:"There the data is not complete",
            variant:"danger"
           }));
         data.forEach(async(items)=> {
            await modules.create({
                quantity:items.Quantity,
                itemName:items.Item,
                price:items.Quantity*items.Price,
                typeOfPayment:methodOfPay
            })
         });
         res.send({
            message:"Transaction successful",
            variant:"success"
         })                   
        } catch (error) {
            console.log(error);
        }
    },
    GetItemsFromDB:async(req,res,next)=>{
        try{
        const fromTB=await usersTB.findAll();
        res.send({
             from:fromTB
        })
        }
        catch(err){
            console.log(err);
        }
    },
    updateUsers:async(req,res,next)=>{
        try{
            const{userId,updateUserRole}=req.body;
            await usersTB.update(
                {roleId:updateUserRole},{
                    where:{id:userId}
                }
            )
            res.send({
                message:"You have successfully updated the role",
                variant:"success",
            })                        
        }
        catch(err){
            console.log(err)
        }
    },
    deleteUserFormDB:async(req,res,next)=>{
        try{
            const userId=req.params.Id;
            await usersTB.destroy({
                where:{id:userId}
            })
            res.send({
                message:"You have successfully deleted the user",
                variant:"success",
            })                        
        }
        catch(err){
            console.log(err)
        }
    },
    dailyExpenses:async(req,res,next)=>{
        try{
            const{Expense,Cost}=req.body;
            if(!Expense||!Cost) throw httpError.Conflict(res.send({message:"one of your fields is empty",variant:"danger"}))
            await DailyExpenses.create({
                Name_of_Expense:Expense,
                Cost:Cost
            });
            res.send({
                message:"you have successfully added the expense",
                variant:"success"
            })            
        }
        catch(err){
            console.log(err);
        }
    },
    dailyExpensesTable:async(req,res,next)=>{
        try{
            const data=await DailyExpenses.findAll();
            const sum= await DailyExpenses.sum("Cost");
            res.send({
                TBdata:data,
                sum:sum
            })
        }
        catch(err){
            console.log(err);
        }
    },
    dailySellsItems:async(req,res,next)=>{
        try{
           const items1=await modules.findAll({
            attributes: ['itemName', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSell']],
            group: ['itemName'],
            order: [[Sequelize.literal('totalSell'), 'DESC',]],
            limit:1
            })
           const items2=await modules.findAll({
            attributes: ['itemName', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSell']],
            group: ['itemName'],
            order: [[Sequelize.literal('totalSell'), 'ASC']],
            limit:1
            })
           const total=await modules.findAll({
             attributes: ['price', [Sequelize.fn('SUM', Sequelize.col('price')), 'price']]
            })
            res.send({
                items1,
                items2,
                total
            })
        }
        catch(err){
            console.log(err);
        }
    },
    graphSells:async(req,res,next)=>{
        try{
           const graphData=await modules.findAll({
            attributes: ['id','itemName', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSell']],
            group: ['itemName'],
            order: [[Sequelize.literal('totalSell')]],
            })
            res.send({
                graphData:graphData
            })
        }
        catch(err){
            console.log(err);
        }
    },
    inventoryRoute:async(req,res,next)=>{
        try{
         const{nameOfItem,Quantity}=req.body;
         if(!nameOfItem||!Quantity) throw httpError.Conflict(res.send({message:"fill in all the Fields",variant:"danger"}))
         await inventory.create({
            NameOfItem:nameOfItem,
            Quantity:Quantity            
         });
         res.send({
            message:"Item has Been added successful",
            variant:"success"
         })
        }
        catch(err){
            console.log(err);
        }
    },
    inventoryMap:async(req,res,next)=>{
      try{
        const items=await inventory.findAll();
        res.send({
           items:items
        })
      }
      catch(err){
        console.log(err)
      }
    },
    removeInventoryItems:async(req,res,next)=>{
        try{
            const inventoryId=req.params.Id;
            await inventory.destroy({
                where:{id:inventoryId}
            })
            res.send({
                message:"inventory item has been removed",
                variant:"success"
            })
        }
        catch(err){
            console.log(err);
        }
    },
    updateInventoryItem:async(req,res,next)=>{
        try {
            const{id,NameOfFood,Cost}=req.body;
            await inventory.update(
                {
                    NameOfFood:NameOfFood,
                    Cost:Cost
                },
                {
                    where:{id:id}
                }
            )
            res.send({
                message:"item has been updated successfully",
                variant:"success"
            })      
        } catch (error) {
            console.log(error)
        }
    },
    FoodAvailableRoute:async(req,res,next)=>{
        try{
         const{nameOfFood,Cost}=req.body;
         if(!nameOfFood||!Cost) throw httpError.Conflict(res.send({message:"fill in all the Fields",variant:"danger"}))
         await FoodAvailable.create({
            NameOfFood:nameOfFood,
            Cost:Cost            
         });
         res.send({
            message:"Food Item has Been added successful",
            variant:"success"
         })
        }
        catch(err){
            console.log(err);
        }
    },
    FoodAvailableMap:async(req,res,next)=>{
      try{
        const items=await FoodAvailable.findAll();
        res.send({
           items:items
        })
      }
      catch(err){
        console.log(err)
      }
    },
    removeFoodAvailable:async(req,res,next)=>{
        try{
            const FoodAvailableId=req.params.Id;
            await FoodAvailable.destroy({
                where:{id:FoodAvailableId}
            })
            res.send({
                message:"Food item has been removed",
                variant:"success"
            })
        }
        catch(err){
            console.log(err);
        }
    },
    updateFoodAvailable:async(req,res,next)=>{
        try {
            const{id,nameOfFood,Cost}=req.body;
            await FoodAvailable.update(
                {
                    NameOfFood:nameOfFood,
                    Cost:Cost
                },
                {
                    where:{id:id}
                }
            )
            res.send({
                message:"Food has been updated successfully",
                variant:"success"
            })      
        } catch (error) {
            console.log(error)
        }
    },
    sendNotification:async(req,res,next)=>{
        try{
            const{message,time}=req.body;
            await notification.create({
                NameNotification:message,
                TimeOfNotification:time
            })
        }
        catch(err){
            console.log(err);
        }
    },
    getNotification:async(req,res,next)=>{
        try{
          const Notifications= await notification.findAll();
          const numberOfRows= await notification.count();
          res.send({
            items:Notifications,
            rows:numberOfRows
          })
        }
        catch(err){
            console.log(err);
        }
     },
    removeNotification:async(req,res,next)=>{
        try{
            const id=req.params.id;
            await notification.destroy({
                where:{id:id}
            })
            res.send({
                message:"The notification has been deleted",
                variant:"success"
            })
        }
        catch(err){
            console.log(err);
        }
    }
}