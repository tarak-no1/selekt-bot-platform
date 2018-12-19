const MYSQL = require('../config/mysqlQueries.js');
const sessions = {};
const timers = {};
process.on('uncaughtException', function (error)
{
    console.log(error.stack);
});
module.exports = (function(){
    let context_structure = {
        "username":"",
        "user_profile" : {
            "want_profile_status": false,
            "profile_status"  : false,
            "concern_status"  : false,
            "age_status"      : false,
            "height_status"   : false,
            "skintone_status" : false,
            "bodyshape_status": false,
            "body_concerns"   : [],
        },
        "benefits"         : [],
        "adjectives"       : [],
        "priority_values"  : {
            "benefits"   :[],
            "adjectives" : []
        },
        "question_number"          : 0,
        "filters"                  : {},
        "range"                    : {},
        "from"                     : 0,
        "adjective_attributes"     : {},
        "previous_user_actions"    : [],
        "question_state"           : true,
        "unanswered_question"      : undefined,
        "chat_id"                  : 1,
        "reason_messages"          : [],
        "is_user_wants_occasion"   : false,
        "occasion_status"          : false,
        "filters_status"           : false,
        "conflict_status"          : false,
        "previous_message"         : "",
        "bot_messages"             : [],
        "welcome_message_status"   : false,
        "trending_status" 		   : false,
        "welcome_back_message_statue" : false,
        "current_entities"         : {},
        "conflict_details"         : {
            "status" : false,
            "type"   : [],
            "values" : {}
        },
        "context_changes" : {
            "previous_state" : {},
            "messages"       : []
        },
        "bot_understood_details":{
            "status"  : true,
            "message" : "",
            "some_identified_message_status" : false
        },
        "adjective_module_details" : {
            "status" : false,
            "question_name":undefined,
            "question_queue" : []
        },
        "changed_product_line_details" : {},
        "proceed_further_question_status"   : false,
        "previous_question_needed_entities" : [],
        "updated_time": 0,
        client_bot_details : {}
    };
    /*
    * This function is used to store the user context into database
    */
    let storeUserContextInDB = (session_id, user_context)=> {
        let obj_to_string = JSON.stringify(user_context);
        let bot_identifier = user_context['client_bot_details']['bot_identifier'];
        let source = user_context['source'];
        let context_updated_time = user_context['updated_time'];
        obj_to_string = obj_to_string.split("'").join('');
        obj_to_string = obj_to_string.split("\n").join(' ');
        obj_to_string = obj_to_string.split("😊").join(' ');

        let current_time = new Date().getTime();
        let session_details_query = "select * from user_details where fb_id='"+session_id+"' and bot_identifier='"+bot_identifier+"';";
        MYSQL.sqlQuery("bot_platform", session_details_query, (session_details)=>{
            // console.log("Sessions Length : ",session_details.length);
            if(session_details.length==0) {
                let insert_query = "insert into user_details(bot_identifier, fb_id, source, username, context, context_updated_time, timestamp, last_visit) values('"+bot_identifier+"','"+session_id+"','"+source+"','"+user_context["username"]+"','"+obj_to_string+"','"+context_updated_time+"', '"+current_time+"', '"+current_time+"');";
                MYSQL.sqlQuery("bot_platform", insert_query, (inserted)=>{
                    console.log("succefully inserted");
                    sessions_info.setTimers(session_id);
                });
            }
            else {
                let session_identifier = session_details[0]["id"];
                let previous_context_updated_time = session_details[0]["context_updated_time"];
                if(previous_context_updated_time<context_updated_time) {
                    let update_query = "update user_details set context = '"+obj_to_string+"', username='"+user_context['username']+"',context_updated_time='"+context_updated_time+"', last_visit='"+current_time+"' where id='"+session_identifier+"';";
                    MYSQL.sqlQuery("bot_platform", update_query, (update_result)=>{
                        // console.log("Context Updated into database");
                        sessions_info.setTimers(session_id);
                    });
                }
            }
        });
    };

    let sessions_info = {
        /*
        * this is used to create user context
        */
        createSession: (session_id, bot_identifier)=> {
            let user_context = JSON.parse(JSON.stringify(context_structure));
            user_context["updated_time"] = new Date().getTime();
            user_context['client_bot_details']['bot_identifier'] = bot_identifier;
            sessions[session_id] = user_context;
            storeUserContextInDB(session_id, user_context);
        },
        getContext: (session_id)=> {
            if(sessions.hasOwnProperty(session_id))
                return sessions[session_id];
            else
                return {}
        },
        clearContext: (session_id)=> {
            let current_user_context = sessions_info.getContext(session_id);
            let new_user_context = JSON.parse(JSON.stringify(context_structure));
            if(current_user_context.hasOwnProperty("user_profile"))
            {
                if(current_user_context["user_profile"].hasOwnProperty("ageInYears"))
                    new_user_context["user_profile"]["ageInYears"] = current_user_context["user_profile"]["ageInYears"];
                if(current_user_context["user_profile"].hasOwnProperty("age"))
                    new_user_context["user_profile"]["age"] = current_user_context["user_profile"]["age"];
                if(current_user_context["user_profile"].hasOwnProperty("height"))
                    new_user_context["user_profile"]["height"] = current_user_context["user_profile"]["height"];
                if(current_user_context["user_profile"].hasOwnProperty("skintone"))
                    new_user_context["user_profile"]["skintone"] = current_user_context["user_profile"]["skintone"];
                if(current_user_context["user_profile"].hasOwnProperty("bodyshape"))
                    new_user_context["user_profile"]["bodyshape"] = current_user_context["user_profile"]["bodyshape"];
            }
            new_user_context["chat_id"] = current_user_context["chat_id"]+1;
            new_user_context['client_bot_details'] = current_user_context['client_bot_details'];
            new_user_context['recast_message'] = current_user_context['recast_message'];
            sessions_info.storeContext(session_id, new_user_context);
        },
        setTimers : (session_id) => {
            if(timers.hasOwnProperty(session_id))
            {
                clearTimeout(timers[session_id]);
            }
            timers[session_id] = setTimeout(function(){

            }, 1200000);
        },
        storeContext: (session_id, user_context)=> {
            sessions[session_id] = user_context;
            user_context["updated_time"] = new Date().getTime();
            storeUserContextInDB(session_id, user_context);
        },
        getUserSessionState: (bot_identifier, session_id, callback)=> {
            console.log("Bot Identifier : ", bot_identifier);
            if(sessions.hasOwnProperty(session_id)) {
                let user_context = sessions_info.getContext(session_id);
                let prev_context_updated_time = user_context["updated_time"];
                let current_time = new Date().getTime();
                let difference = current_time - parseInt(prev_context_updated_time);
                console.log("Difference1 : ", difference);
                if(difference<=1200000) {
                    callback("yes");
                } else {
                    sessions_info.clearContext(session_id);
                    callback("expired");
                }
            } else {
                let session_details_query = "select * from user_details where fb_id='"+session_id+"' and bot_identifier='"+bot_identifier+"';";
                MYSQL.sqlQuery('bot_platform',session_details_query, (session_details)=>{
                    if(session_details.length!=0) {
                        let current_time = new Date().getTime();
                        let user_session_details = session_details[0];
                        let user_context_in_db, prev_context_updated_time;
                        try {
                            user_context_in_db = user_session_details["context"].split("\n").join(' ');
                            user_context_in_db = JSON.parse(user_context_in_db);
                            prev_context_updated_time = user_context_in_db["updated_time"];
                            console.log("Prev time1 ", prev_context_updated_time);
                        }catch (e){
                            console.log("Error : ",e);
                            user_context_in_db = JSON.parse(JSON.stringify(context_structure));
                            prev_context_updated_time = current_time - 600001;
                            console.log("Prev time2 ", prev_context_updated_time)
                        }
                        sessions_info.storeContext(session_id, user_context_in_db);
                        let difference = current_time - parseInt(prev_context_updated_time);
                        console.log("Difference2 : ", difference);
                        if(difference<=1200000) {
                            callback("yes");
                        }
                        else {
                            sessions_info.clearContext(session_id);
                            callback("expired");
                        }
                    }
                    else {
                        sessions_info.createSession(session_id, bot_identifier);
                        callback('no');
                    }
                });
            }
        }
    };
    return sessions_info;
})();