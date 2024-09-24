const userTokens= require('../model/userToken');
const usersDB=require('../model/Users.model');
const jwt = require('jsonwebtoken');
const HttpErrors=require('http-errors');
const {RefreshSecreteKey,AccessSecreteKey}=process.env;
const jwtToken=async(req,res,next)=>{
    const AccessToken = req.headers["Authorization"];
    const RefreshToken = req.headers["Authorization"];
    if(!AccessToken||!RefreshToken) return res.send({
        message:'access denied',
        variant:"danger"
    });
    try{
        // **check if the access token is valid
        const AccessTokenVerified= jwt.verify(token,AccessSecreteKey);
        req.user=AccessTokenVerified;
        if(!AccessTokenVerified){
        const getRefreshToken= await userTokens.findOne({where:{token:RefreshToken}}) ;
        if(!getRefreshToken) throw HttpErrors.Conflict(res.send({
            message:"invalid refresh toke",
            variant:"danger"
        }));
        const RefreshTokenVerified= jwt.verify(token,RefreshSecreteKey);
        if(!RefreshTokenVerified){
        const UserInfo= await usersDB.findOne({where:{id:getRefreshToken.userId}})
        if(!UserInfo)throw HttpErrors.Conflict({
            message:"the user dose not exist in the db",
            variant:"danger"
        })
        // !! user RefreshToken
        const newRefreshToken = jwt.sign(
            {
              userId: UserInfo.id,
              userEmail: UserInfo.Email,
              userRoleId: UserInfo.roleId
            },
            RefreshSecreteKey,
            {expiresIn:'30d'}
          );
          getRefreshToken.update({token: newRefreshToken});
          res.send({
            message:"refresh the page and try again",
            variant:"danger"
          })
        }
        const UserInfo= await usersDB.findOne({where:{id:getRefreshToken.userId}})
        if(!UserInfo)throw HttpErrors.Conflict({
            message:"the user dose not exist in the db",
            variant:"danger"
        })       
        // !! user AccessToken
        const newAccessToken = jwt.sign(
            {
             userId:UserInfo.id,
             userEmail:UserInfo.Email,
             userRoleId:UserInfo.roleId
            },
            AccessSecreteKey,
            {expiresIn:'14m'}
            );
        res.send({
            message:"refresh the page and try again",
            variant:"danger",
            AccessToken:newAccessToken
        })
    }
    req.user=RefreshTokenVerified;
    next();
}
    catch(err){
        console.log("this token is invalid");
        res.send({
            message:"the token has expired"
        })
    }
}
module.exports=jwtToken;