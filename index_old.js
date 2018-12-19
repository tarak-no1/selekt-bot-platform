var express = require('express'),
   app = express(),
   fs = require("fs"),
   path = require("path"),
   bodyParser = require('body-parser'),
   multer = require('multer'),
   cors = require('cors'),
   path = require('path');

var MYSQL = require("./config/mysqlQueries.js");
var FB = require("./facebook.js");
var SESSIONS = require("./sessions.js");
var FUNCTIONS = require("./functions.js");
let WOMEN_CATEGORY = require("./operations/women_fashion/women_category.js");
let EMAIL_VERIFICATIONS = require("./email_verification.js");

var elasticSearch = require("./config/elasticSearch.js");
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use('/static',express.static('public'));
app.use('/chatbot-solution',express.static('views'));
app.use('/women', WOMEN_CATEGORY);
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Credentials", "true");
   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
   res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
   next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
let storage = multer.diskStorage({ //multers disk storage settings
   destination: function (req, file, cb) {
      cb(null, './inventory/')
   },
   filename: function (req, file, cb)
   {
      let filename = file.originalname;
      let ext = path.extname(filename).toLowerCase();
      console.log(ext);
      if(ext=='.xml')
      {
         filename = filename.toLowerCase();
         filename = filename.replace(ext,"");
         filename = filename+'-'+new Date().getTime()+".xml";
         console.log("File Name :", filename)
         cb(null, filename);
      }
      else
      {
         cb(null, filename);
      }
   }
});

let upload = multer({ storage: storage });
/*
* this api is used to update the inventory
*/
app.get('/chatbot-solution',(req, res)=>
{
    res.render('index');
});


// app.get('/chatbot-solution/*',(req, res)=>
// {
//     res.render('index');
// });

app.post('/chatbot-solution/update-inventory', upload.single('myFile'), function(req, res)
{
   console.log("Request : ",req.body, req.file);

   if(req.file)
   {
      FUNCTIONS.saveInventoryDetails(req.body, req.file.originalname, function()
      {
         res.send({error_code:false,err_desc:null});
      });
   }
   else
      res.send({error_code:true,err_desc:"Got an error in file"});
});
/*
* this api is used to check the user login details
*/
app.post('/chatbot-solution/login', function(req, res)
{
   console.log("In login Api");
   let data = req.body;
   let email = data["email"];
   let password = data["password"];
   let encript_email = EMAIL_VERIFICATIONS.Base64Encode(email);
   console.log("Encoded email : ",encript_email);
   let response_obj =
   {
      status : false,
      message : "Invalid credentials",
      client_data : {}
   };
   let encript_password = EMAIL_VERIFICATIONS.Base64Encode(password);
   // getting the client details based on email and password
   let query = "select * from client_details where email='"+email+"' and password='"+encript_password+"';";
   MYSQL.sqlQuery('bot_platform', query, function(client_details)
   {
      if(client_details.length>0) //checking user is existed or not
      {
         if(parseInt(client_details[0]["verification_status"])==1)
         {
            response_obj.status = true;
            response_obj.message = "";
            response_obj.client_data = {
               client_id : client_details[0]["id"],
               email : client_details[0]["email"],
               company_name : client_details[0]["company_name"],
               created_on : client_details[0]["timestamp"]
            };
         }
         else
         {
            response_obj.message = "Your Email verification is not completed";
         }
      }
      res.send(response_obj);
   });
});
/*
* this api is used to process the user signup details
*/
app.post('/chatbot-solution/signup', function(req, res)
{
   let data = req.body;
   console.log("In Signup Api", data);
   let email = data["email"];
   let password = data["password"];
   let company_name = data["company_name"];
   let response_obj =
   {
      status : false,
      message : "Having problem while creating your details",
      client_data : {}
   };
   if(!email || email=="")
   {
      response_obj["message"] = "Invalid Email Address";
      res.send(response_obj);
   }
   else if(!password || password=="" || password.length<5)
   {
      response_obj["message"] = "Password length greater than 5 characters";
      res.send(response_obj);
   }
   else{
      let client_details_query = "select * from client_details where email='"+email+"';";
      MYSQL.sqlQuery('bot_platform', client_details_query, function(result)
      {
         if(result.length==0) //checking the email is already existed or not
         {
            let created_time = new Date().getTime();
            EMAIL_VERIFICATIONS.verifyEmail(email, created_time, function(email_status)
            {
               console.log(email_status);
               if(!email_status)
               {
                  response_obj.message = "Error while sending verification details to the "+email;
                  res.send(response_obj);
               }
               else
               {
                  let encript_password = EMAIL_VERIFICATIONS.Base64Encode(password);
                  // inserting the new client details in the database.
                  let insert_query = "insert into client_details(password, email, company_name, timestamp)values('"+encript_password+"','"+email+"','"+company_name+"','"+created_time+"');";
                  MYSQL.sqlQuery('bot_platform',insert_query, function(insert_result)
                  {
                     response_obj.status = true;
                     response_obj.message = "Check your mail for verification";
                     res.send(response_obj); // sending the response
                  });
               }
            });
         }
         else
         {
            response_obj.message = "Email is already registered";
            res.send(response_obj);
         }
      });
   }
});
app.get('/chatbot-solution/email-verification',function(req, res)
{
   let data = req.query;
   let token1 = data["token1"].split("'").join("");
   let token2 = data["token2"].split("'").join("");
   let email = EMAIL_VERIFICATIONS.Base64Decode(token1);
   let timestamp = EMAIL_VERIFICATIONS.Base64Decode(token2);
   console.log("Email : ", email, token1);
   console.log("timestamp : ", timestamp, token2);
   let query = "select * from client_details where email='"+email+"' and timestamp='"+timestamp+"';";
   MYSQL.sqlQuery('bot_platform', query, function(result)
   {
      if(result.length>0)
      {
         let verification_status = parseInt(result[0]["verification_status"]);
         if(verification_status==0)
         {
            let update_client_details_query = "update client_details set verification_status=1 where email='"+email+"';";
            MYSQL.sqlQuery('bot_platform', update_client_details_query, function(up_result){
               res.render("./server_files/email-verify",{"source":JSON.stringify({"verify_status":true, "message":"Email Verification Successful"})});
            });
         }
         else
         {
            res.render("./server_files/email-verify",{"source":JSON.stringify({"verify_status":true, "message":"Your Email Id already verified"})});
         }
      }
      else
      {
         res.render("./server_files/email-verify",{"source":JSON.stringify({"verify_status":false, "message":"Error in Email verification"})});
      }
   });
});
/*
* this is used to process the forgot user details
*/
app.post('/chatbot-solution/forgot-password', function(req, res)
{
   let data = req.body;
   let email = data["email"];
   let client_details_query = "select * from client_details where email='"+email+"';";
   MYSQL.sqlQuery('bot_platform', client_details_query, function(client_details)
   {
      if(client_details.length>0)
      {
         let client_data = client_details[0];
         let timestamp = client_data["timestamp"];
         EMAIL_VERIFICATIONS.forgotPassword(email, timestamp, function(verify_status){
            console.log("Email sent Status : ", verify_status);
         });
         res.send({status : true, message : "Check your mail : "+email});
      }
      else
      {
         res.send({status : false, message : "No Email Existed with "+email});
      }
   });
});
/*
* this api is used to send the change the user password template
*/
app.get('/chatbot-solution/change-password',function(req, res)
{
   let data = req.query;
   let token1 = data["token1"].split("'").join("");
   let token2 = data["token2"].split("'").join("");
   let email = EMAIL_VERIFICATIONS.Base64Decode(token1);
   let timestamp = EMAIL_VERIFICATIONS.Base64Decode(token2);

   let query = "select * from client_details where email='"+email+"' and timestamp='"+timestamp+"';";
   MYSQL.sqlQuery('bot_platform', query, function(result)
   {
      if(result.length>0)
      {
         res.render("./views/server_files/change_password",{"source":JSON.stringify({"verify_status":true, "email" : email,"message":""})});
      }
      else
      {
         res.render("./views/server_files/change_password",{"source":JSON.stringify({"verify_status":false, "email": email, "message":"Error in Email verification"})});
      }
   });
});
/*
* this api is used to update the password
*/
app.post('/chatbot-solution/update-password', function(req, res)
{
   let data = req.body;
   console.log(data);
   let email = data["email"];
   let password = data["password"];
   let encript_password = EMAIL_VERIFICATIONS.Base64Encode(password);
   let query = "select * from client_details where email='"+email+"';";
   MYSQL.sqlQuery('bot_platform', query, function(result)
   {
      if(result.length>0)
      {
         let update_query = "update client_details set password ='"+encript_password+"' where email='"+email+"';";
         MYSQL.sqlQuery('bot_platform', update_query, function(update_results)
         {
            res.send({status : true});
         });
      }
      else
      {
         res.send({status : false});
      }
   });
});
/*
* this api is used to get the all chatbot-solution based on the client id
*/
app.post('/chatbot-solution/get-all-bots', function(req, res)
{
   let data = req.body;
   console.log("Get all bots api : ",data);
   let client_id = parseInt(data["client_id"]);
   let bot_details_query = "select distinct(bot_details.id), bot_details.bot_name, bot_details.working_status, bot_details.bot_type, bot_details.inventory_status, bot_details.page_identifier, bot_details.timestamp as bot_created_time, inventory.timestamp as inventory_updated_time, bot_details.inventory_status, bot_details.launch_time,client_fb_pages.page_name from bot_details left join client_fb_pages on bot_details.page_identifier = client_fb_pages.page_identifier left join inventory on bot_details.id = inventory.bot_identifier where bot_details.client_identifier='"+client_id+"';"; // getting the all bots details based on client_identifier
   MYSQL.sqlQuery("bot_platform", bot_details_query, function(bot_details)
   {
      let bot_details_response = bot_details.map(function(data)
      {
         let obj =
         {
            bot_id : data["id"],
            bot_name : data["bot_name"],
            bot_type : data["bot_type"],
            page_identifier : data["page_identifier"],
            created_on : data["bot_created_time"],
            inventory_status : (parseInt(data["inventory_status"])==1),
            inventory_updated_time : data["inventory_updated_time"],
            launch_time : data['launch_time'],
            linked_page_name : (data["page_name"]?data["page_name"]:""),
            messenger_link : "https://www.messenger.com/t/"+data["page_identifier"],
            working_status : (data["working_status"]==1)
         };
         return obj;
      });
      res.send(bot_details_response); // sending the all bots response
   });
});

/*
* this api is used to create new bot details
*/
app.post('/chatbot-solution/create-bot', function(req, res)
{
   let data = req.body;
   console.log("Data : ", data);
   let client_id = data["client_id"];
   let bot_type = data["bot_type"];
   let bot_name = data["bot_type"];
   let country = data["country"];
   let fb_access_token = data["fb_access_token"];
   let page_identifier = data["page_identifier"];
   let whitelisted_domains = ["https://www.prodx.in", "https://www.selekt.in"];

   let response_obj = {
      status : false,
      message : "Your are already have "+bot_type+" bot"
   };
   // verifing the fb access token
   FB.verifyAccessToken(fb_access_token, whitelisted_domains, function(token_status)
   {
      if(token_status) // checking the verification response status
      {
         let check_page_identifier_details_query = "select  * from "
         let check_bot_details = "select * from bot_details where bot_type='"+bot_type+"' and client_identifier='"+client_id+"';"; // getting the bot details
         MYSQL.sqlQuery('bot_platform', check_bot_details, function(bot_details)
         {
            if(bot_details.length==0) // checking the any bot is already existed or not
            {
               let insert_bot_details = "insert into bot_details(client_identifier, fb_access_token, page_identifier, bot_type, bot_name, country, timestamp)values('"+client_id+"','"+fb_access_token+"','"+page_identifier+"', '"+bot_type+"', '"+bot_name+"', '"+country+"','"+new Date().getTime()+"');";
               //inserting the new bot details into bot_details table
               MYSQL.sqlQuery('bot_platform', insert_bot_details, function(insert_result){
                  response_obj.status = true;
                  response_obj.message = "Your bot is created";
                  res.send(response_obj);
               });
            }
            else
            {
               //sending the error response
               res.send(response_obj);
            }
         });
      }
      else
      {
         response_obj.message = "Enter Valid Facebook Token";
         res.send(response_obj); //sending the error response
      }
   });
});
/*
* this api is used to update the bot details based on bot_identifier
*/
app.post('/chatbot-solution/update-bot', function(req, res)
{
   let data = req.body;
   console.log("Data : ", data);
   let client_id = data["client_id"];
   let bot_id = data["bot_id"];
   let fb_access_token = data["fb_access_token"];
   let page_identifier = data["page_identifier"];
   let whitelisted_domains = ["https://www.prodx.in", "https://www.selekt.in"];
   let response_obj =
   {
      status : false,
      message : ""
   };
   // verifing the current fb access token is valid or not
   FB.verifyAccessToken(fb_access_token, whitelisted_domains, function(token_status)
   {
      if(token_status) // checking the verification status
      {
         let update_bot_details = "update bot_details set fb_access_token='"+fb_access_token+"', page_identifier='"+page_identifier+"' where id='"+bot_id+"';";
         // updating the bot details
         MYSQL.sqlQuery('bot_platform', update_bot_details, function(bot_details)
         {
            let update_available_status_query = "update client_fb_pages set is_already_connected=1 where page_identifier in (select page_identifier from bot_details);";
            MYSQL.sqlQuery('bot_platform', update_available_status_query, function(update_result)
            {
               response_obj.status = true;
               response_obj.message = "Your page is updated."
               res.send(response_obj);
            });
         });
      }
      else
      {
         response_obj.message = "Enter Valid Facebook Token";
         res.send(response_obj); // sendinig the error response.
      }
   });
});
app.post('/chatbot-solution/update-bot-status', function(req, res)
{
   let data = req.body;
   console.log("Bot status : ", data);
   let bot_id = data.bot_id;
   let status = data.bot_status;
   let working_status = (status?1:0);
   let update_bot_details_query = "update bot_details set working_status="+working_status+" where id='"+bot_id+"';";
   MYSQL.sqlQuery('bot_platform', update_bot_details_query, function(update_result)
   {
      res.send({status : !status});
   });
});
/*
* this api is used to disconnect the fb page from bot.
*/
app.post('/chatbot-solution/disconnect-fb-page', function(req, res)
{
   let data = req.body;
   console.log(data);
   let fb_access_token = data["fb_access_token"];
   let page_identifier = data["page_identifier"];
   let update_bot_query = "update bot_details set fb_access_token='', page_identifier='' where page_identifier='"+page_identifier+"';";
   let update_fb_pages = "update client_fb_pages set is_already_connected=0 where page_identifier='"+page_identifier+"';";
   //updating the bot details
   MYSQL.sqlQuery("bot_platform", update_bot_query, function(update_result)
   {
      // updating the fb pages
      MYSQL.sqlQuery("bot_platform", update_fb_pages, function(result){
         res.send({"status":true,message:"Your page disconnected"});
      });
   });
});
/*
* this api is used to create fb details of client
*/
app.post('/chatbot-solution/create-client-fb-details',function(req, res)
{
   let data = req.body;
   console.log("In create cliend fb details", data);
   let client_id = parseInt(data["client_id"]);
   let username = data["username"].toString();
   let fb_id = data["fb_id"].toString();
   let profile_image = data["profile_image"];
   let fb_pages = data["fb_pages"];

   let get_fb_user_details = "select * from client_fb_login_details where fb_id='"+fb_id+"' and client_identifier='"+client_id+"' order by timestamp desc;";
   // getting the client fb details
   MYSQL.sqlQuery('bot_platform', get_fb_user_details, function(fb_user_details)
   {
      let create_fb_user_details = "insert into client_fb_login_details(client_identifier, username,profile_image, fb_id, login_status, timestamp)values('"+client_id+"','"+username+"','"+profile_image+"','"+fb_id+"','"+1+"','"+new Date().getTime()+"');";
      if(fb_user_details.length>0) // checking the user details are already existed or not
      {
         create_fb_user_details = "update client_fb_login_details set username='"+username+"', profile_image='"+profile_image+"',login_status=1, timestamp='"+new Date().getTime()+"' where client_identifier='"+client_id+"' and fb_id='"+fb_id+"';";
      }
      // it will create user details if user is not exists otherwise it will update the user details.
      MYSQL.sqlQuery('bot_platform', create_fb_user_details, function(result)
      {
         //getting the client details.
         MYSQL.sqlQuery('bot_platform', get_fb_user_details, function(user_details)
         {
            let user_data = user_details[0];
            // saving the all fb page details into database.
            FUNCTIONS.savePageDetails(user_data, fb_pages, function(status)
            {
               res.send({"status" : status}); // sending the response
            });
         });
      });
   });
});

/*
* this api is used to logout from the facebook page.
*/
app.post('/chatbot-solution/fb-logout', function(req, res)
{
   let data = req.body;
   let client_id = data["client_id"];
   let update_client_details_query = "update client_fb_login_details set login_status=0 where client_identifier='"+client_id+"';";
   // updating the login_status of the user.
   MYSQL.sqlQuery('bot_platform', update_client_details_query, function(update_result){
      res.send({status : true});
   });
});
/*
* this api is used the get all client fb page details
*/
app.post('/chatbot-solution/get-fb-pages', function(req, res)
{
   let data = req.body;
   console.log("In get fb pages : ",data)
   let client_id = data["client_id"];
   let response_obj =
   {
      status : false,
      username : "",
      profile_image : "",
      fb_pages : []
   };

   let fb_user_details_query = "select * from client_fb_login_details where client_identifier='"+client_id+"' and login_status=1 order by timestamp desc;";
   // getting the client fb details
   MYSQL.sqlQuery('bot_platform', fb_user_details_query, function(user_details)
   {
      if(user_details.length>0) // checking the fb page details are existed or not
      {
         response_obj["status"] = true;
         let user_data = user_details[0];
         response_obj["username"] = user_data["username"];
         response_obj["profile_image"] = user_data["profile_image"];
         let get_pages_query = "select client_fb_pages.page_name, bot_details.client_identifier, client_fb_pages.access_token,client_fb_pages.page_identifier,client_fb_pages.image_url,client_fb_pages.is_already_connected, bot_details.bot_type, bot_details.id from client_fb_pages left join bot_details on client_fb_pages.page_identifier = bot_details.page_identifier where client_fb_pages.fb_user_identifier='"+user_data["id"]+"';";
         // getting the client fb page details.
         MYSQL.sqlQuery('bot_platform', get_pages_query, function(page_details)
         {
            response_obj["fb_pages"] = page_details.map(function(page_data)
            {
               let obj =
               {
                  client_id : page_data["client_identifier"],
                  bot_id : page_data["id"],
                  page_name : page_data["page_name"],
                  access_token : page_data["access_token"],
                  page_identifier : page_data["page_identifier"],
                  page_image_url : page_data["image_url"],
                  connected_bot_type : page_data["bot_type"],
                  is_already_connected : (parseInt(page_data["is_already_connected"])==1)
               };
               return obj;
            });
            res.send(response_obj);
         });
      }
      else
      {
         res.send(response_obj);
      }
   });
});
/*
* this api is used to get the client created bot details
*/
app.post('/chatbot-solution/get-bot-details', function(req, res)
{
   let data = req.body;
   let client_id = data["client_id"];
   let bot_id = data["bot_id"];
   let get_bot_details_query = "select * from bot_details where id = '"+bot_id+"';";
   // getting the bot details based on bot identifier
   MYSQL.sqlQuery('bot_platform', get_bot_details_query, function(bot_details)
   {
      let bot_data = bot_details[0];
      delete bot_data["id"];
      delete bot_data["client_identifier"];
      res.send(bot_data);
   });
});

/*
* this api is used to delete the bot
*/
app.post('/chatbot-solution/delete-bot', function(req, res){
   let data = req.body;
   let client_id = data["client_id"];
   let bot_type = data["bot_type"];

   let get_bot_details_query = "select * from bot_details where bot_type='"+bot_type+"' and client_identifier='"+client_id+"';";
   // getting the bot details
   MYSQL.sqlQuery('bot_platform', get_bot_details_query, function(result){
      if(result.length>0)
      {
         let bot_identifier = result[0]["id"];
         let user_details_query = "delete from user_details where bot_identifier='"+bot_identifier+"';";
         let inventory_details_query = "delete from inventory where bot_identifier='"+bot_identifier+"';";
         let bot_details_query = "delete from bot_details where id='"+bot_identifier+"';";
         //deleting the users_details of fb page
         MYSQL.sqlQuery('bot_platform', user_details_query, function(user_details){
            //deleting the inventory details of the bot
            MYSQL.sqlQuery('bot_platform', inventory_details_query, function(inventory_result){
               //deleting the bot details
               MYSQL.sqlQuery('bot_platform', bot_details_query, function(bot_result){
                  res.send({"status":true});
               });
            });
         });
      }
      else
      {
         res.send({status : false});
      }
   });
});
app.post('/chatbot-solution/contact-us', function(req, res){
   let data = req.body;
   let client_id = data["client_id"];
   let bot_id = data["bot_id"];
   let email = data["email"];
   let message = data["message"];
   let contact_detail_query = "insert into contact_us(bot_identifier, email, message, timestamp)values('"+bot_id+"','"+email+"','"+message+"','"+new Date().getTime()+"');";
   MYSQL.sqlQuery('bot_platform', contact_detail_query, function(update_result)
   {
      res.send({status : true});
   });
});

/*
*this api is used to verify the fb verify token and webhook
*/
app.get('/chatbot-solution/webhook', (req, res) => {
   console.log("In get");
   console.log(req.query);
   if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "just_do_it") {
      res.send(req.query['hub.challenge']);
   } else {
      res.sendStatus(400);
   }
});

/*
* this api is used to get the messages from fb page
*/
app.post('/chatbot-solution/webhook', (req, res) =>
{
  console.log("In POST sWebhook");
  let data = req.body;

  console.log(JSON.stringify(data, null, 2));
  // getting fb message
  let messaging = FB.getFirstMessagingEntry(data);
  if(messaging)
  {
      let page_identifier = messaging.recipient.id;
      let sender = messaging.sender.id;
      
      let bot_details_query = "select * from bot_details where page_identifier='"+page_identifier+"';";
      // getting the bot details token
      MYSQL.sqlQuery('bot_platform', bot_details_query, function(bot_details)
      {
         if(bot_details.length>0) // checking the bot is existed or not
         {
            let fb_access_token = bot_details[0]["fb_access_token"];
            let bot_type = bot_details[0]["bot_type"];
            let country = bot_details[0]["country"].toLowerCase();
            let bot_identifier = bot_details[0]["id"];
            console.log("Country : ", country);
            // checking the user context is existed or not
            if(!SESSIONS.isSessionExists(page_identifier, sender))
            {
               // creating the user context
               SESSIONS.createContext(page_identifier, sender);
               let user_context = SESSIONS.getContext(page_identifier, sender,"main_context");
               user_context["women_fashion"]["country"] = country;
               
               let inventory_details_query = "select * from inventory where bot_identifier='"+bot_identifier+"'";
               //getting the inventory details
               MYSQL.sqlQuery('bot_platform',inventory_details_query, function(inventory_result)
               {
                  let inventory_deals_status = true;
                  if(inventory_result.length>0)
                  {
                     inventory_deals_status = (inventory_result[0]["deals_status"]=="true");
                     console.log("Inventory Status : ", inventory_deals_status, typeof inventory_deals_status);
                  }

                  SESSIONS.storeContext(page_identifier, sender, "main_context");
                  // getting the fb user details
                  FB.getUserDetails(fb_access_token, sender, function(user_details)
                  {
                     let client_details_query = "select * from client_details where id in (select client_identifier from bot_details where id='"+bot_identifier+"');";
                     // getting the client details
                     MYSQL.sqlQuery('bot_platform', client_details_query, function(client_details)
                     {
                        let company_name = client_details[0]["company_name"];
                        console.log("Company Name : ", company_name);
                        // updating the user details into database
                        FUNCTIONS.updateUserDetails(bot_identifier, user_details, sender);
                        let user_info = {
                           page_identifier : page_identifier,
                           sender : sender,
                           fb_access_token : fb_access_token,
                           bot_type : bot_type,
                           username : user_details["first_name"],
                           company_name : company_name,
                           inventory_deals_status : inventory_deals_status
                        };
                        // this function is used to send the welcome message to the user
                        FUNCTIONS.sendWelcomeMessage(user_info);
                     });
                  });
               });
            }
            else
            {
               let user_message;
               if (messaging.postback)
               {
                  // Yay! We got a new message payload!
                  // We retrieve the Facebook user ID of the sender
                  console.log("Got Payload message "+ messaging.postback.payload)
                  //taking reply as user message
                  user_message= messaging.postback.payload;
               }
               else if(messaging.message)
               {
                  // Yay! We got a new message!
                  // We retrieve the Facebook user ID of the sender
                  //taking message as user message
                  user_message=messaging.message.text;
                  if(messaging.message.hasOwnProperty("quick_reply"))
                  {
                     // taking message from quick suggestions
                     user_message = messaging.message.quick_reply.payload;
                  }
               }
               console.log("USER MESSAGE : ", user_message);
               // processing the message based on the category
               FUNCTIONS.chooseCategory(page_identifier, sender, bot_type, user_message?user_message.toLowerCase():"");
            }
         }
         else
         {
            console.log("Bot Not Found");
         }
      });
  }
  res.sendStatus(200).end();
});
var server = app.listen(4545, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})