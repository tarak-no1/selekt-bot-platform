const HELPER = require('./helper');
const SESSIONS = require('./sessions');
const FB_FASHION_BOT = require('./women_fashion/bots/fb_fashion_bot');
const BOT_QUESTIONS = require('./women_fashion/supporters/bot_questions.js');
const UNDO_STATE = require('./women_fashion/supporters/undo_state');
const FILTER_LIST = require('./women_fashion/supporters/filter_list');
const WordMapping = require('../public/json/word_mapping.json');
const MAPPING = require('./women_fashion/supporters/mapping');
const elasticSearch = require('../config/elasticSearch');
const ConversationGraph = require('../public/json/conversation_graph');

module.exports = (function () {
    let isUserInputValid = (messaging)=>{
        // if fb message is having attachment send false
        // console.log(messaging);
        if(messaging && messaging.hasOwnProperty("attachment") && (messaging.attachment.type=='text'||messaging.attachment.type=='payload')) {
            return true;
        }
        return false;
    };
    supporter_functions = {
        processRecastMessage : (req, res)=>{
            let data = req.body;
            console.log(JSON.stringify(data, null, 2));
            let messaging = data['message'];
            let chat_id = data.chatId;
            let session_id = data.senderId;
            let page_id = chat_id.split('-')[0];
            let username = "";
            if(messaging.hasOwnProperty('data') && messaging['data'].hasOwnProperty('userName'))
                username = messaging.data.userName;

            let source = "facebook";
            if(data.hasOwnProperty('origin'))
                source = data['origin'];

            HELPER.getRecastClient(session_id, page_id, function (client_bot_details, client) {
                let bot_working_status = client_bot_details['working_status'];
                let bot_identifier = client_bot_details['bot_identifier'];
                console.log("Bot Working Status : ", bot_working_status, bot_identifier);
                if(bot_working_status && parseInt(bot_working_status)) {
                    SESSIONS.getUserSessionState(bot_identifier, session_id, function (session_state) {
                        console.log(session_state);
                        let user_context = SESSIONS.getContext(session_id);
                        user_context['source'] = source;
                        user_context['username'] = username;
                        user_context['client_bot_details'] = client_bot_details;
                        client.connect.handleMessage(req, res, function (recast_message) {
                            // console.log('I receive: ', JSON.stringify(message, null, 2));
                            user_context['recast_message'] = recast_message;
                            if (session_state == "no") { // checking whether user sessions is previously existed or not
                                user_context['welcome_message_status'] = true;
                                SESSIONS.storeContext(session_id, user_context);
                            } else if (session_state == "expired") { // checking whether session is expired or not
                                user_context['welcome_back_message_status'] = true;
                                SESSIONS.storeContext(session_id, user_context);
                            }
                            // checking whether user message is valid or not
                            // console.log("Valid Message Status : ",isUserInputValid(messaging));
                            if (isUserInputValid(messaging)) {
                                FB_FASHION_BOT.processUserMessage(session_id, messaging);
                            }
                            else {
                                user_context = SESSIONS.getContext(session_id);
                                // getting invalid user message from bot
                                let other_inputs_message = BOT_QUESTIONS.otherInputMessage();
                                user_context["bot_messages"].push(other_inputs_message);
                                SESSIONS.storeContext(session_id, user_context);
                                //sending previous state messages to user
                                UNDO_STATE.sendPreviousMessages(session_id);
                            }
                        });
                    });
                }
            });
        },
        processBodyConcerns : (result) => {
            var id = result["id"];
            var values=Object.values(result["data"]);
            var keys = Object.keys(result["data"]);
            console.log(id,keys,values);
            let user_context = SESSIONS.getContext(id);
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
            //console.log(user_context);
            user_context["user_profile"]["concern_status"] = true;
            if(!user_context["body_concerns"])
                user_context["body_concerns"] = [];
            //user_context["body_concerns"].concat(values);
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
            let sentence = "";
            for(let i in values)
            {
                let product_line = MAPPING.productLineToDbMap[user_context["product_line"]];
                //console.log(values[i]);
                let reason_prefixes = [
                    "I have chosen " + user_context["product_line"],
                    "I curated " + user_context["product_line"],
                    "I am showing " + user_context["product_line"]
                ];
                if(WordMapping[product_line]["body_concern"].hasOwnProperty(values[i]))
                {
                    let object = WordMapping[product_line]["body_concern"][values[i]];
                    user_context["body_concerns"].push(object);
                    //console.log(WordMapping[product_line]["body_concern"][values[i]]);
                    let benefit_key = object["benefit_key"];
                    let reason = object["reasons"]
                    console.log(benefit_key,reason);
                    if(benefit_key!=undefined&&user_context["benefits"].indexOf(benefit_key)==-1)
                    {
                        user_context["benefits"].push(benefit_key);
                        console.log(benefit_key);
                    }
                    if(reason!="na"&&reason!="")
                    {
                        let random_index = HELPER.getRandomNumber(0, reason_prefixes.length);
                        sentence += values[i]+" :\n";
                        sentence += reason_prefixes[random_index] + " " + reason+"\n\n";
                    }
                }
            }
            SESSIONS.storeContext(id,user_context);
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(sentence!="")
            {
                let reason_message = BOT_QUESTIONS.textMessages(sentence);
                user_context["bot_messages"].push(reason_message);
            }

            let product_list_reason_message = BOT_QUESTIONS.productListReasonMessage(user_context["username"],user_context["user_profile"]);
            user_context["bot_messages"].push(product_list_reason_message);
            SESSIONS.storeContext(id,user_context);
            console.log("he he he")
            FB_FASHION_BOT.flowChat(id);
            //calling main flow
        },
        processGetFilters : (data,callback) => {
            let session_id = data["session_id"];
            try
            {
                let context = SESSIONS.getContext(session_id);
                console.log(session_id,context["product_line"]);
                let product_line = MAPPING.productLineToDbMap[context["product_line"]];
                console.log(product_line);
                let benefits = context["benefits"];
                let context_filters = context["filters"];
                let context_ranges = context["range"];
                let added_filters = data["add_filters"];
                let remove_filters = data["remove_filters"];
                let require_attribute = data["require_attribute"];
                console.log("Added Filters :",JSON.stringify(added_filters, null, 2));
                console.log("Removed Filters :",JSON.stringify(remove_filters, null,2));
                if(remove_filters)
                {
                    for(let i in remove_filters)
                    {
                        let attribute = remove_filters[i].key;
                        let values = remove_filters[i].values;
                        if(context_filters.hasOwnProperty(attribute))
                        {
                            for(let j=0;j<context["filters"][attribute].length;j++)
                            {
                                let is_there = contains.call(values,context_filters[attribute][j]);
                                if(is_there)
                                {
                                    context_filters[attribute].splice(j,1);
                                }
                            }
                        }
                        else if(attribute=="discount_price" || attribute=="discount_percent")
                        {
                            delete context_ranges["range"][attribute];
                        }
                    }
                }
                let filters = [], discount_percentage_filter_status = true;
                if(added_filters)
                {
                    for(let i in added_filters)
                    {
                        let key = added_filters[i].key,values = added_filters[i].values;
                        if(key=="discount_price")
                        {
                            let numbers = values[0].match(/[-]{0,1}[\d.]*[\d]+/g);
                            let obj = {"range":{"discount_price":{}}};
                            if(numbers.length==2)
                            {
                                obj.range.discount_price["type"] = "between";
                                obj.range["discount_price"]["start"] = numbers[0];
                                obj.range["discount_price"]["end"] = numbers[1];
                            }
                            else
                            {
                                obj.range.discount_price["type"] = "above";
                                obj.range["discount_price"]["start"] = numbers[0];
                            }
                            if(context_ranges.hasOwnProperty("range")&&!context_ranges["range"].hasOwnProperty("discount_price"))
                            {
                                context_ranges["discount_price"] = obj["range"]["discount_price"];
                            }
                            else
                            {
                                //you need add cotext changes removed values
                                context_ranges["discount_price"] = obj["range"]["discount_price"];
                            }
                            //filters.push(obj);
                        }
                        else if(key=="discount_percent")
                        {
                            let percentage = values[0].match(/[-]{0,1}[\d.]*[\d]+/g);
                            let obj = {"range":{"discount_percent":{}}};

                            if(values[0].indexOf("more")!=-1)
                            {
                                obj.range["type"] = "above";
                                obj.range["discount_percent"]["start"] = percentage[0];
                            }
                            else
                            {
                                obj.range["type"] = "under";
                                obj.range["discount_percent"]["start"] = percentage[0];
                            }
                            //filters.push(obj);
                            if(context_ranges.hasOwnProperty("range")&&!context_ranges["range"].hasOwnProperty("discount_percent"))
                            {
                                context_ranges["discount_percent"] = obj["range"]["discount_percent"];
                            }
                            else
                            {
                                //you need add cotext changes removed values
                                context_ranges["discount_percent"] = obj["range"]["discount_percent"];
                            }
                        }
                        else
                        {
                            if(context_filters.hasOwnProperty(key))
                                context_filters[key].concat(values)
                            else
                                context_filters[key] = values;
                        }
                    }
                }
                context["filters"] = context_filters;
                context["range"] = context_ranges;
                FILTER_LIST.getFilterCount(product_line,context,require_attribute,function(filter_result){
                    //console.log(JSON.stringify(filter_result[0]));
                    let data = {};
                    data["type"] = "filter_list";
                    data["options"] = filter_result;
                    callback(data);
                });
            }
            catch(e)
            {
                console.log(e);
                callback({});
            }
        },
        processGetTrends :(body,callback)=> {
            let sessionId = body.id;
            let context = SESSIONS.getContext(sessionId);
            context["trends"] =  true;
            SESSIONS.storeContext(sessionId, context);
            let priority_values = {
                benefits : ["trends_dec"],
                adjectives : []
            };
            let from = 0;
            HELPER.getTrendsCount(sessionId, function(total_products)
            {
                console.log("total_products",total_products)
                let source = {
                    sessionId : sessionId,
                    total : total_products
                };
                callback(source);
            });
        },
        processUpdateFilters : (data) => {
            let session_id = data["session_id"];
            let added_filters = data["add_filters"];
            let remove_filters = data["remove_filters"];
            let context = SESSIONS.getContext(session_id);
            context = UNDO_STATE.storePreviousStateDetails(context, "filters");

            context["filters_status"] = true;
            let context_filters = Object.keys(context["filters"]);

            if(remove_filters)
            {
                for(let i in remove_filters)
                {
                    let attribute = remove_filters[i].key;
                    let values = remove_filters[i].values;
                    if(context["filters"].hasOwnProperty(attribute))
                    {
                        for(let j=0;j<context["filters"][attribute].length;j++)
                        {
                            let is_there = contains.call(values,context["filters"][attribute][j]);
                            if(is_there)
                            {
                                context["filters"][attribute].splice(j,1);
                            }
                        }
                    }
                    else if(attribute=="discount_price" || attribute=="discount_percent")
                    {

                        delete context["range"][attribute];
                    }
                }
            }
            if(added_filters)
            {
                for(let i in added_filters)
                {
                    let key = added_filters[i].key,values = added_filters[i].values;
                    if(context["filters"].hasOwnProperty(key))
                    {
                        context["filters"][key].concat(values);
                    }
                    else if(key=="discount_price")
                    {
                        let numbers = values[0].match(/[-]{0,1}[\d.]*[\d]+/g);
                        let obj = {"range":{"discount_price":{}}};
                        if(numbers.length==2)
                        {
                            obj.range.discount_price["type"] = "between";
                            obj.range["discount_price"]["start"] = numbers[0];
                            obj.range["discount_price"]["end"] = numbers[1];
                        }
                        else
                        {
                            obj.range.discount_price["type"] = "above";
                            obj.range["discount_price"]["start"] = numbers[0];
                        }
                        if(!context["range"].hasOwnProperty("discount_price"))
                        {
                            context["range"]["discount_price"] = obj["range"]["discount_price"];
                        }
                        else
                        {
                            //you need add cotext changes removed values
                            context["range"] = obj["range"];
                        }
                        //filters.push(obj);
                    }
                    else if(key=="discount_percent")
                    {
                        let percentage = values[0].match(/[-]{0,1}[\d.]*[\d]+/g);
                        let obj = {"range":{"discount_percent":{}}};

                        if(values[0].indexOf("more")!=-1)
                        {
                            obj.range["type"] = "above";
                            obj.range["discount_percent"]["start"] = percentage[0];
                        }
                        else
                        {
                            obj.range["type"] = "under";
                            obj.range["discount_percent"]["start"] = percentage[0];
                        }
                        //filters.push(obj);
                        if(!context["range"].hasOwnProperty("discount_percent"))
                        {
                            context["range"]["discount_percent"] = obj["range"]["discount_percent"];
                        }
                        else
                        {
                            //you need add cotext changes removed values
                            context["range"] = obj["range"];
                        }
                    }
                    else
                    {
                        if(context["filters"].hasOwnProperty(key))
                            context["filters"][key].concat(values);
                        else
                            context["filters"][key] = values;
                    }
                }
            }
            let selected_option_details = {
                type : "filters_question",
                added_filters : added_filters,
                remove_filters : remove_filters
            };
            console.log(added_filters,remove_filters);
            context["unanswered_question"] = "filtersQuestion";
            //context["previous_user_messages"].push(selected_option_details);
            SESSIONS.storeContext(session_id, context);
            HELPER.getProductCount(context,function(total_products){
                let display_product_count_message = BOT_QUESTIONS.displayProductCount(total_products, session_id);
                context["bot_messages"].push(display_product_count_message);
                context["question_state"] = false;
                SESSIONS.storeContext(session_id, context);
                HELPER.sendBotMessages(session_id);
            });
        },
        getProductList : (session_id,callback) => {
            let context = SESSIONS.getContext(session_id);
            context["trends"] =  undefined;
            SESSIONS.storeContext(session_id, context);
            HELPER.getProductCount(context, function(total_products)
            {
                console.log("total",total_products);
                let source =
                {
                    sessionId : session_id,
                    total : total_products,
                };
                callback(source);
            });
        },
        getAdjectiveReasons : (query,callback) => {
            let product_line = query.product_line;
            let adjective_value = query.backend_key;
            product_line = MAPPING.productLineToDbMap[product_line];
            console.log(product_line);
            let all_display_names = HELPER.getElementsDisplayName(product_line,"adjectives", [adjective_value]);
            let adjective_name = all_display_names[adjective_value];
            console.log("Adjective Name : ", adjective_name,adjective_value);
            let adj_query = {
                index :"styling_rules",
                type : "adjectives_rules",
                body : {'query':{"bool":{"must":[{"match_phrase":{"product_line_name":product_line}},{"match_phrase":{"adjective_value":adjective_value}}]}}}
            };
            elasticSearch.runQuery(adj_query, function(response, total, err)
            {
                console.log(JSON.stringify(response,null,2));
                let adjective_names = adjective_name.split("_").join(" ");
                if (adjective_names.charAt(adjective_names.length - 1) == 's') {
                    adjective_names = adjective_names.substr(0, adjective_names.length - 1);
                }
                let obj = {
                    adjective_name : adjective_names,
                    attribute : "",
                    values : []
                };
                if(!err && total>0)
                {
                    let attribute_dependencies = response[0]["_source"]["attribute_dependencies"];
                    obj["attribute"] = attribute_dependencies[0]["attribute_type"].split("_").join(" ");
                    obj["values"] = attribute_dependencies[0]["attribute_value"];
                }
                callback(obj);
            });
        },
        getRefineList : (body,callback) => {
            if(body.type=="deals")
            {
                let options = ["premium brands", "high end brands", "any brand"];
                let data = {
                    id : body.id,
                    question : "",
                    options : options.map(function(a){return {"key":a, "value":a}}),
                    type:"deals"
                };
                callback(data);
            }
            else
            {
                let user_context = SESSIONS.getContext(body.id);
                let next_question = user_context['adjective_module_details']['question'];
                console.log(JSON.stringify(next_question,null,2));
                let data={
                    id:body.id,
                    question:next_question["text"].split("\n").join(" "),
                    options:next_question.options,
                    type:"adjective_module"
                };
                callback(data);
            }
        },
        processRefineListAnswers : (answers_data) => {
            var id = answers_data["id"];
            var answers = answers_data["selected_keys"];
            var type = answers_data["type"];
            if(type=="deals")
            {
                let user_context = SESSIONS.getContext(id);
                /*user_context["unanswered_question"]="brand_deals_question";
                fashion_bot.processingMessage(id,answers.join(","));*/
            }
            else
            {
                let user_context = SESSIONS.getContext(id);
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");

                let adjective_module_needed_details = answers;
                console.log(JSON.stringify(adjective_module_needed_details,null,2));
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "current_entities");
                user_context["current_entities"] = {adjective_module_needed_entities : adjective_module_needed_details};

                console.log(JSON.stringify(user_context["current_entities"]),null,2);
                //user_context['unanswered question'] = "adjectiveModuleQuestion";
                SESSIONS.storeContext(id,user_context);
                FB_FASHION_BOT.flowChat(id);
                //here we need to call adjective module
                //fashion_bot.processingUserAnswer["refineListQuestion"](id,answers, selected_option_details);
            }
        },
        sendProductList : (query,callback) => {
            let session_id = query["id"];
            let user_context = SESSIONS.getContext(session_id);
            //console.log(user_context)
            let from = query["page_no"];
            console.log(user_context["trends"],"trends", session_id);
            if(from)
                user_context["from"] = from;
            else
                user_context["from"] = 0;
            SESSIONS.storeContext(session_id,user_context);
            user_context = SESSIONS.getContext(session_id);
            if(user_context["trends"])
            {
                console.log(user_context["trends"],"trends2");
                HELPER.getTrends(session_id, function(total_products)
                {
                    callback({"products_data":total_products,"product_line":user_context["product_line"], "page_no":user_context["from"]});
                });
            }
            else
            {
                HELPER.getProducts(session_id,function(products_data){
                    console.log("seding products length : ",products_data.length);
                    callback({"products_data" : products_data,"product_line":user_context["product_line"], "page_no":user_context["from"]});
                });
            }
        }
    };
    return supporter_functions;
})();