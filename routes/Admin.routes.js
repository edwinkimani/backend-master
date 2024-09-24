const express =require('express');
const { itemsSold, GetItemsFromDB, updateUsers, deleteUserFormDB, dailyExpenses, dailyExpensesTable, dailySellsItems, inventoryRoute, inventoryMap, removeInventoryItems, updateInventoryItem, updateFoodAvailable, removeFoodAvailable, FoodAvailableMap, FoodAvailableRoute, sendNotification, getNotification, removeNotification, graphSells } = require('../controller/admin.controller');
const routes=express.Router();

routes.post('/sell',itemsSold);
routes.get('/usersFromDB',GetItemsFromDB);
routes.put('/uppDateUser',updateUsers);
routes.post('/DailyExpenses',dailyExpenses);
routes.get('/DailyExpensesTable',dailyExpensesTable);
routes.get('/DailySellsItems',dailySellsItems);
routes.post('/inventory',inventoryRoute);
routes.delete('/removeUser/:Id',deleteUserFormDB);
routes.delete('/removeInventory/:Id',removeInventoryItems);
routes.get('/mapInventory',inventoryMap)
routes.patch('/updateInventoryItem',updateInventoryItem);
routes.post('/FoodAvailable',FoodAvailableRoute);
routes.delete('/removeFoodAvailable/:Id',removeFoodAvailable);
routes.get('/mapFoodAvailable',FoodAvailableMap);
routes.patch('/updateFoodAvailable',updateFoodAvailable);
routes.post('/notification',sendNotification);
routes.get('/getNotification',getNotification);
routes.delete('/RemoveNotification/:id',removeNotification);
routes.get('/graphSells',graphSells)
module.exports=routes;