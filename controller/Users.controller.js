// **Database models
const model=require ('../model/Users.model');
const security=require('../model/SecurityQuestion');
const roles=require('../model/roles.model');
const userToken=require('../model/userToken');
const userActivity=require("../model/userActivity");

// **User Dependencies 
const HttpErrors=require('http-errors');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomString=require('randomstring');

module.exports={
    RegisterUsers:async(req,res,next)=>{
        try{
            //!! user input validation
            const{FirstName,SecondName,Email,PhoneNumber,Password,SecurityNumber,SecurityAnswer}=req.body;
            if(!Email||!Password || !FirstName||!SecondName||!PhoneNumber||!SecurityAnswer||!SecurityNumber){
                const err=HttpErrors.Conflict(res.send({
                    message:"Their is a filed which is empty Fist Name, Second Name, Email, Phone and Password",
                    variant:"danger"
                }))
                return next(err)
            }

            //!!Email validation 
            const EmailValidate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if(!EmailValidate.test(Email))throw HttpErrors.Conflict(
                res.send({
                    message:`The email provided is invalid ${Email}`,
                    variant:"danger"
                }))

            //!!password validation
            const PASSWORD_REGEX=/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;
            if(!PASSWORD_REGEX.test(Password)) throw HttpErrors.Conflict(
                res.send({
                    message:"The password provided is invalid",
                    variant:"danger"
                }))

            //!! email checking **check if the given email is available in the database
            const exists= await model.findOne({where:{Email:Email}});   
            if(exists) throw  HttpErrors.Conflict(
                res.send({
                    message:`This email has been used ${Email}`
                    ,variant:"danger"
                }));
            // !! password encryption
            const hashedAnswer=bcrypt.hashSync(SecurityAnswer,10);
            const hashed =bcrypt.hashSync(Password,10);
            const newUser = await model.create(
                {
                    FirstName:FirstName,
                    SecondName:SecondName,
                    Email:Email,
                    PhoneNumber:PhoneNumber,
                    Password:hashed,
                    SecurityAnswer:hashedAnswer,
                    SecurityNumber:SecurityNumber,
                }
            ) 
            newUser.save;

            // !! user AccessToken
            const AccessToken = jwt.sign(
                {
                 userId:newUser.id,
                 userEmail:newUser.Email,
                 userRoleId:newUser.roleId,
                 userRole:newUser.roleName
                },
                process.env.AccessSecreteKey,
                {expiresIn:'14m'}
                );

            // !! user RefreshToken
            const RefreshToken = jwt.sign(
                {
                 userId:newUser.id,
                 userEmail:newUser.Email,
                 userRoleId:newUser.roleId,
                 userRole:newUser.roleName
                },
                process.env.RefreshSecreteKey,
                {expiresIn:'30d'}
                );
            // !!save the refresh token to the database 
            const userRefreshToken= await userToken.findOne({where:{userId:newUser.id}});
            if(userRefreshToken) await userToken.destroy();
            userToken.create({
                userId:newUser.id,
                token:RefreshToken
            });
           
            // !!send response to the client 
            res.send({
                status:"ok",
                message:"The user has been registered",
                variant:"success",
                firstName:FirstName,
                SecondName:SecondName,
                email:Email,
                phone:PhoneNumber,
                userRole:newUser.roleName,
                AccessToken,
                RefreshToken,
                userId:newUser.id
            })          
        }
        catch(err){
            console.error(`this is the error:`,err);
            next(err);
        }
    },
    loginUser:async(req,res,next)=>{
        try{
            const{Email,Password}=req.body;
            if(!Email||!Password){
                const err=HttpErrors.Conflict(res.send({message:"Their is a filed which is empty Email and Password",variant:"danger"}))
                return next(err);
            }
            const exists= await model.findOne({where:{Email:Email}});   
            if(!exists) throw  HttpErrors.Conflict(res.send({message:`${Email} This email dose not exist`,variant:"danger"}));  
            const role = await roles.findOne({where:{id:exists.roleId}});
            const passwordComp=bcrypt.compareSync(Password,exists.Password);
            if(!passwordComp)throw HttpErrors.Conflict(
                res.send({
                    message:"The password entered is invalid for the user",
                    variant:"danger",
                    forgotPassword:"true",
                    usersEmail:Email,
                }));
                const AccessToken = jwt.sign(
                    {
                     userId:exists.id,
                     userEmail:exists.Email,
                     userRoleId:exists.roleId,
                     userRole:role.roleName
                    },
                    process.env.AccessSecreteKey,
                    {expiresIn:'14m'}
                    );
    
                // !! user RefreshToken
                const RefreshToken = jwt.sign(
                    {
                     userId:exists.id,
                     userEmail:exists.Email,
                     userRoleId:exists.roleId,
                     userRole:role.roleName
                    },
                    process.env.RefreshSecreteKey,
                    {expiresIn:'30d'}
                    );
                // !!save the refresh token to the database 
                const userRefreshToken= await userToken.findOne({where:{userId:exists.id}});
                if(userRefreshToken) await userToken.destroy({where:{userId:exists.id}});
                userToken.create({
                    userId:exists.id,
                    token:RefreshToken
                });
                // ** save activity
                await userActivity.create({
                    userEmail:Email
                })
                res.send({
                    message:"You have login successfully",
                    variant:"success",
                    firstName:exists.FirstName,
                    SecondName:exists.SecondName,
                    email:exists.Email,
                    phone:exists.PhoneNumber,
                    userRole:role.roleName,
                    AccessToken,
                    RefreshToken,
                    userId:exists.id
                });
        }
        catch(err){
            console.error(`the err message is`,err);
            next(err)
        }
    },
    protectRoute:async(req,res,next)=>{
        res.send({
            message:"this is the protected route"
        })
    },
    forgotPasswordRoute:async(req,res,next)=>{
      try{
        const Answer=req.params.answer;
        const{Email}=req.body;
        const existOne = await model.findOne({where:{Email:Email}});
        const compareAnswer=await bcrypt.compare(Answer,existOne.SecurityAnswer);
        if(!compareAnswer)throw HttpErrors.Conflict(res.send({message:"The security Answer you have entered dose not match with the answer you gave during signup",variant:"danger"}));        
        const randomNumber = randomString.generate(8);
        bcrypt.hash(randomNumber, 10, async (err, hashed) => {
            if (err) {
              console.error('Error hashing password:', err);
              return;
            }        
            try {
              const exists = await model.findOne({ where: { Email: Email } }); 
              if (exists) {
                firstName=exists.FirstName;
                exists.update({ Password: hashed }); 
                console.log(randomNumber); 
                console.log(Email);        
                console.log('User password updated successfully');
              } 
              else {
                console.log('User not found');
              }
            } catch (error) {
              console.error('Error updating user password:', error);
            }
          });    
        let transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
            user:process.env.user,
            pass:process.env.pass
        },
        tls: {
            rejectUnauthorized: false
        }
        });
        const mailOptions = {
            from: process.env.user, 
            to: Email,
            subject: 'Password Reset', 
            text: 'Hello this is a test', 
            html:
            `<div style="display: flex;align-items: center;justify-content: center;margin-top: 40px;">
               <div style="min-height: 75vh;background-color: #f8f8f8;width: 550px;border-radius: 15px;border-top: #dc143c solid 15px;">
                <div style="width: 550px; display:flex; justify-content: center;margin-top: 30px;">
                  <img src="https://lh3.googleusercontent.com/a/AAcHTtdMlpPtGZRhkV9lTYDSFlHOqkGDA3aOOXCBvUz12L3P4w=s288-c-no" alt="img" style="border-radius:62.5px;width: 125px;height: 125px;margin-left: 20px;margin-top: 20px;">
                </div>
                <div style="padding: 20px;font-family:Arial, Helvetica, sans-serif;margin-top: 40px;">
                    <span>Dear ${existOne.FirstName},</span>
                    <p>
                        The email we send contains a default password that has been generated and will allow you to log in to your system and reset your password. The password will be valid for 5 minutes before it expires.
                    </p>
                    <span>password :<span style="color:#dc143c;">${randomNumber}</span></span>
                    <p>Jirani's Restaurant</p>
                </div>
                <div style="display: flex;align-items:end;justify-content:center;border-top: #f1efef solid 0.3px;font-family:Arial, Helvetica, sans-serif; font-size: 12px;">
                    <p>Powered By Jirani's Restaurant</p>
                </div>
              </div>
            </div>`
        };
        transport.sendMail(mailOptions, function(err, info) {
            if (err) {
                res.send({
                    message:"check your Internet connection and try again",
                    variant:"danger"
                })
            } else {
              
            }
        });
        res.send({
            message:"your one time password has been send to your email check your inbox",
            variant:"success"
          })      
       }
        catch(err){
            console.log(err);
        }
    },
    securityQuestion:async(req,res,next)=>{
        const securityId=req.params.Id;
        const exists=await security.findOne({where:{id:securityId}});
        const Question= exists.securityQuestion;
        res.send({
            question:Question
        })
    },
    getSecurityQuestion:async(req,res,next)=>{
        const{Email}=req.body;
        const exists =await model.findOne({where:{Email:Email}});
        const securityNumberId=exists.SecurityNumber;
        const securityExists = await security.findOne({where:{id:securityNumberId}});
        const question= securityExists.securityQuestion;
        res.send({
            secretKey:question
        })
    },
    sendEmailToAdmin:async(req,res,next)=>{
        try{
            const{Email,FirstName,SecondName}=req.body;    
            let transport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                user:process.env.user,
                pass:process.env.pass
            },
            tls: {
                rejectUnauthorized: false
            }
            });
            const getAdmins=await model.findOne({where:{roleId:2}});
            const superAdmins=await model.findOne({where:{roleId:4}})
            if(getAdmins){
            const mailOptions = {
                from: process.env.user, 
                to:getAdmins.Email,
                subject: 'Access Elevation', 
                text: 'Hello this is a test', 
                html:`<div style="display: flex;align-items: center;justify-content: center;margin-top: 40px;">
                <div style="min-height: 75vh;background-color: #f8f8f8;width: 550px;border-radius: 15px;border-top: #dc143c solid 15px;">
                <div style="width: 550px; display:flex; justify-content: center;margin-top: 30px;">
                <img src="https://lh3.googleusercontent.com/a/AAcHTtdMlpPtGZRhkV9lTYDSFlHOqkGDA3aOOXCBvUz12L3P4w=s288-c-no" alt="img" style="border-radius:62.5px;width: 125px;height: 125px;margin-left: 20px;margin-top: 20px;">
                </div>
                <div style="padding: 20px;font-family:Arial, Helvetica, sans-serif;margin-top: 40px;">
                    <span>Dear ${getAdmins.FirstName},</span>
                        <p>The user ${FirstName}${SecondName} with the email ${Email} is requesting for an access elevation.Please log in to the system and navigate to the users tab and choose an action of choice</p>
                    <p>Jirani's Restaurant</p>
                </div>
                <div style="display: flex; align-items:center;justify-content:center;border-top: #f1efef solid 0.3px;font-family:Arial, Helvetica, sans-serif; font-size: 12px;">
                    <p>Powered By Jirani's Restaurant</p>
                </div>
           </div>
         </div>`
            }
            transport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err)
                    res.send({
                        message:"check your Internet connection and try again",
                        variant:"danger"
                    })
                } else {
                    console.log(info)                  
                }
            });
            }
            else{
                const mailOptions = {
                    from: process.env.user, 
                    to:superAdmins.Email,
                    subject: 'Password Reset', 
                    text: 'Hello this is a test', 
                    html:`<div style="display: flex;align-items: center;justify-content: center;margin-top: 40px;">
                    <div style="min-height: 75vh;background-color: #f8f8f8;width: 550px;border-radius: 15px;border-top: #dc143c solid 15px;">
                    <div style="width: 550px; display:flex; justify-content: center;margin-top: 30px;">
                    <img src="https://lh3.googleusercontent.com/a/AAcHTtdMlpPtGZRhkV9lTYDSFlHOqkGDA3aOOXCBvUz12L3P4w=s288-c-no" alt="img" style="border-radius:62.5px;width: 125px;height: 125px;margin-left: 20px;margin-top: 20px;">
                    </div>
                    <div style="padding: 20px;font-family:Arial, Helvetica, sans-serif;margin-top: 40px;">
                        <span>Dear ${superAdmins.FirstName},</span>
                            <p>The user ${FirstName}${SecondName} with the email ${Email} is requesting for an access elevation.Please log in to the system and navigate to the users tab and choose an action of choice</p>
                        <p>Jirani's Restaurant</p>
                    </div>
                    <div style="display: flex;align-items:end;justify-content:center;border-top: #f1efef solid 0.3px;font-family:Arial, Helvetica, sans-serif; font-size: 12px;">
                        <p>Powered By Jirani's Restaurant</p>
                    </div>
               </div>
             </div>`
                }
                transport.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        res.send({
                            message:"check your Internet connection and try again",
                            variant:"danger"
                        })
                    } else {
                        res.send({
                            message:"The notification has been sent to the admin check your email for confirmation",
                            variant:"success"
                        })             
                    }
                });
            }
        res.send({
            message:"The notification has been sent to the admin check your email for confirmation",
            variant:"success"
        })
        }
        catch(err){
            console.log(err);
        }
    },  
    clearActivity:async(req,res,next)=>{
        try{
        const Email=req.params.Email;
        userActivity.destroy({where:{userEmail:Email}});
        res.send({
            message:"ok"
        })
        }
        catch(err){
            console.log(err);
        }
    },
    confirmPassword:async(req,res,next)=>{
        try{
         const{password,userId}=req.body;
         const findUser= await model.findOne({where:{id:userId}});
         const comparePassword=bcrypt.compareSync(password,findUser.Password)
         if(!comparePassword) throw HttpErrors.Conflict(res.send({message:"The password entered dose not match",variant:"danger"}));
         res.send({
            message:"The password dose not check out",
            variant:"danger"
         })
        }
        catch(err){
            console.log(err);
        }
    },
    changeUserInfo:async(req,res,next)=>{
        try{
        const{firstName,SecondName,phone,email,Password,userId}=req.body;

        const EmailValidate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!EmailValidate.test(email))throw HttpErrors.Conflict(
         res.send({
          message:`The email provided is invalid ${email}`,
          variant:"danger"
        }))
        const hashed= bcrypt.hashSync(Password,10);
        await module.update({
            FirstName:firstName,
            SecondName:SecondName,
            PhoneNumber:phone,
            Password:hashed,
            Email:email,
            where:{id:userId}
        });
        res.send({
            message:"The user has been updated",
            variant:"success"
          })      
        }
        catch(err){
            console.log(err);
        }
    }
}