const MYSQL = require("./config/mysqlQueries.js");
const PythonShell = require('python-shell');
/*
* this function is used to update fb bot user details into database
*/
function updateUserDetails(bot_identifier, user_details, sender)
{
	let username = user_details["username"];
	let email = user_details["email"];

	let user_details_query = "select * from user_details where bot_identifier='"+bot_identifier+"' and fb_id='"+sender+"';";
    MYSQL.sqlQuery('bot_platform', user_details_query, function(user_details){
       let user_query;
       if(user_details.length>0)
       {
       		user_query = "update user_details set last_visit='"+new Date().getTime()+"';";
       }
       else
       {
          user_query = "insert into user_details(bot_identifier, username, email, fb_id, timestamp, last_visit)values('"+bot_identifier+"', '"+username+"', '"+email+"', '"+sender+"', '"+new Date().getTime()+"', '"+new Date().getTime()+"');";
       }
       MYSQL.sqlQuery('bot_platform', user_query, function(result){
       		console.log("user details updated");
       });
    });
}
/*
* this function is used to save the client fb page details into database.
*/
function savePageDetails(user_data, fb_pages, callback)
{
	let get_pages_query = "select * from client_fb_pages where fb_user_identifier='"+user_data["id"]+"';";
    MYSQL.sqlQuery('bot_platform', get_pages_query, function(page_results)
    {
    	let all_pages = fb_pages.concat();
       if(page_results.length>0)
       {
          fb_pages = fb_pages.filter(function(page_data)
          {
             let status = true;
             for(let i in page_results)
             {
                if(page_results[i]["page_identifier"]==page_data["page_identifier"])
                {
                   status = false;
                   page_results.splice(i, 1);
                   break;
                }
             }
             return status;
          });
       }
       if(fb_pages.length>0)
       {
          let values = fb_pages.map(function(page_data){
             let obj = "('"+user_data["id"]+"','"+page_data["page_name"].split("'").join("")+"','"+page_data["access_token"]+"','"+page_data["page_identifier"]+"', '"+page_data["page_image_url"]+"')";
             return obj;
          });
          let pages_query = "insert into client_fb_pages(fb_user_identifier, page_name, access_token, page_identifier, image_url)values"+values.join(",")+";";
          MYSQL.sqlQuery('bot_platform', pages_query, function(insert_result)
          {
          	let update_available_status_query = "update client_fb_pages set is_already_connected=1 where page_identifier in (select page_identifier from bot_details);";
         		MYSQL.sqlQuery('bot_platform', update_available_status_query, function(update_result)
         		{
         			callback(true);
         		});
          });
       }
       else if(page_results.length>0)
       {
       		let remove_not_existing_pages_query = "update client_fb_pages set is_available=0 where id in ("+page_results.map(function(obj){return obj["id"];}).join(", ")+");";
       		MYSQL.sqlQuery('bot_platform', remove_not_existing_pages_query, function(update_result)
       		{
       			callback(true);
       		});
       }
       else if(all_pages.length>0)
       {
       		let update_columns_obj = 
       		{
       			"page_name" : {"sentence":"","db_key":"page_name"},
       			"access_token" : {"sentence":"","db_key":"access_token"},
       			"image_url" : {"sentence":"","db_key":"page_image_url"}
       		};
       		let update_id_values = [];
       		let fields = Object.keys(update_columns_obj);
       		all_pages.forEach(function(data){
       			update_id_values.push(data["page_identifier"].toString());
       			fields.forEach(function(field){
       				update_columns_obj[field]["sentence"] += " when "+data["page_identifier"].toString()+" then '"+data[update_columns_obj[field]["db_key"]].split("'").join("")+"'";
       			});
       		});
       		let update_query = "update client_fb_pages set ";
       		let update_bot_token_query = "update bot_details set ";
       		let bot_token_sentences = [];
       		let sentences = [];
       		fields.forEach(function(field){
       			sentences.push(field+" = (case page_identifier"+update_columns_obj[field]["sentence"]+" end)");
       			if(field=="access_token")
       			{
       				bot_token_sentences.push("fb_access_token = (case page_identifier"+update_columns_obj[field]["sentence"]+" end)");
       			}
       		});
       		update_bot_token_query += bot_token_sentences.join(", ");
       		update_bot_token_query += " where page_identifier in ("+update_id_values.join(", ")+")";
       		
       		update_query += sentences.join(", ");
       		update_query += " where fb_user_identifier='"+user_data["id"]+"' and page_identifier in ("+update_id_values.join(", ")+")";
       		MYSQL.sqlQuery('bot_platform', update_query, function(result)
       		{
            console.log("\n\n");
            console.log(update_bot_token_query);
            console.log("\n\n")
       			MYSQL.sqlQuery('bot_platform', update_bot_token_query, function(result)
            {
              let update_available_status_query = "update client_fb_pages set is_already_connected=1 where page_identifier in (select page_identifier from bot_details);";
              MYSQL.sqlQuery('bot_platform', update_available_status_query, function(update_result)
              {
                callback(true);
              });
            });
       		});
       }
       else
       {
       		callback(true);
       }
    });
}

function saveInventoryDetails(client_data, inventory_file_name, callback)
{
  let bot_type = client_data.bot_type;
  let client_id = client_data.client_id;
  let contact_number = client_data.contact_number;
  let deals_status = client_data.deals_status;
  let current_time = new Date().getTime();

  let bot_query = "select * from bot_details where client_identifier='"+client_id+"' and bot_type='"+bot_type+"';";
  // getting the bot details
  MYSQL.sqlQuery('bot_platform',bot_query, function(bot_details)
  {
    if(bot_details.length>0) // checking the bot is existed or not
    {
      let bot_identifier = bot_details[0]["id"];
      let inventory_query = "select * from inventory where bot_identifier='"+bot_identifier+"';";
      // getting the inventory details
      MYSQL.sqlQuery('bot_platform', inventory_query, function(inventory_result){
        let update_inventory_query = "insert into inventory(bot_identifier, inventory_name, deals_status, contact_number, timestamp)values('"+bot_identifier+"','"+inventory_file_name+"','"+deals_status+"','"+contact_number+"','"+current_time+"');";
        if(inventory_result.length>0) // checking the inventory already existed or not
        {
          update_inventory_query = "update inventory set inventory_name='"+inventory_file_name+"', deals_status='"+deals_status+"', contact_number='"+contact_number+"', timestamp='"+current_time+"', live_on='' where bot_identifier='"+bot_identifier+"';"
          // runInventoryUpdate(inventory_result[0]["id"], inventory_file_name);
        }
        // it will insert if details not exist, otherwise it will update the result.
        MYSQL.sqlQuery('bot_platform', update_inventory_query, function(result){
          let update_bot_details = "update bot_details set inventory_status = 1 where id='"+bot_identifier+"';";
          MYSQL.sqlQuery('bot_platform', update_bot_details, function(update_res){
            callback(); 
          });  
        });
      });
    }
    else
    {
      callback();
    }
  });
}
function runInventoryUpdate(inventory_id, filename)
{
  console.log("In inventory update ")
  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './inventory_update/'+inventory_id+'/',
    args: [inventory_id, filename]
  };

  PythonShell.run('my_script.py', options, function (err, results) {
    if (err) console.log(err);
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
  });
}
/*
* this function is used to get the intersecting elements of two arrays
*/
function array_intersection(a, b)
{
    let result = [];
    for(let i in a)
    {
        if(b.indexOf(a[i])!=-1)
        {
            result.push(a[i]);
        }
    }

    return result;
}
module.exports = 
{
	updateUserDetails : updateUserDetails,
	savePageDetails : savePageDetails,
  	saveInventoryDetails : saveInventoryDetails
};