const express=require('express');
const { RegisterUsers, loginUser, protectRoute, forgotPasswordRoute, userInfoRoute, securityQuestion, getSecurityQuestion, sendEmailToAdmin, clearActivity, changeUserInfo, confirmPassword} = require('../controller/Users.controller');
const jwtToken = require('../MiddleWare/users.middleware');
const routes=express.Router()
// !!/users
routes.post('/register',RegisterUsers);
routes.post('/login',loginUser);
routes.get('/protected',jwtToken,protectRoute);
routes.post('/forget-password/:answer',forgotPasswordRoute);
routes.post('/sendEmailToAdmin',sendEmailToAdmin);
routes.get('/SecurityQuestion/:Id',securityQuestion);
routes.post('/GetQuestion',getSecurityQuestion);
routes.delete('/logout/:Email',clearActivity);
routes.patch('/userInfo',jwtToken,changeUserInfo);
routes.get('/userPassword',confirmPassword);
module.exports=routes;