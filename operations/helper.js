const MYSQL = require('../config/mysqlQueries');
const RECAST = require('./recastBot');
const SESSIONS = require('./sessions');
const MONGO = require('../config/mongoQueries');
const BenefitMapping = require('../public/json/benefits_mapping.json');
const WordMapping = require('../public/json/word_mapping.json');
const AdjectiveQuestionFlow = require('../public/json/question_flow.json');
const AttributeBodyProfileMap = require('../public/json/attribute_to_body_profile_mapping.json');
const MAPPING = require('./women_fashion/supporters/mapping');

module.exports = (function () {
    /*
    * this function is used to build the mongo query based on user requirements
    */
    let buildQuery = (user_context)=>{
        //console.log(user_context);
        let benefits = user_context['benefits'];
        let filters = user_context['filters'];
        let range_values = user_context['range'];

        let priority_values = user_context['priority_values'];
        /*console.log(Object.keys(user_context));
        console.log(priority_values);
        console.log(typeof (priority_values));*/
        let priority_benefits= priority_values['benefits'];
        let priority_adjectives = priority_values['adjectives'];
        let adjectives = user_context['adjectives'];
        priority_adjectives = adjectives.concat(priority_adjectives);
        let adjective_attributes = user_context['adjective_attributes'];


        let occasion_status = user_context['occasion_status'];
        let product_line = MAPPING.productLineToDbMap[user_context['product_line']];

        let attributes = Object.keys(filters);
        let and_query = [{"pdpData.landingPageUrl":{"$exists":true},"style_images":{"$exists":true}}], or_query = [];

        // generating filters query
        let filter_query = {};
        attributes.forEach(function (attrb) {
            if(filters[attrb].length>0)
                filter_query["product_filter."+attrb] = {"$in": filters[attrb]};
        });
        if(Object.keys(filter_query).length>0)
            and_query.push(filter_query);

        //generating range values query !!!!!!!!!!!!!!!!!!
        let range_query = {};
        Object.keys(range_values).forEach(function (attribute) {
            let range_obj = range_values[attribute];

            range_query["product_filter."+attribute] = {
                "$gte": parseInt(range_obj["start"])||0,
                "$lt" : parseInt(range_obj["end"])||10000000
            };
        });
        if(user_context["trending_status"])
        {
            and_query.push({"trending_status" : true});
        }
        if(user_context["deal_status"])
        {
            and_query.push({"deal" : true});
        }
        if(Object.keys(range_query).length>0){
            and_query.push(range_query);
        }
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let priority_query = [];
        // making priority values query ======================
        priority_benefits = priority_benefits.filter(function (benefit) {
            let benefit_type = BenefitMapping[product_line][benefit];
            //console.log(benefit,(benefit!=undefined && (benefit_type!='broad_occasions' || !occasion_status)));
            return (benefit!=undefined && (benefit_type!='broad_occasions' || !occasion_status));
        });
        let all_benefits = benefits.concat(priority_benefits);
        if(priority_benefits.length>0) {
            let obj = { "new_updated_benefit":{ "$in":priority_benefits } };
            and_query.push(obj);
        }
        // ==================================================

        // making user benefits query *******************
        /*  if(benefits.length>0)
          {
              let obj = { "new_updated_benefit":{ "$in": benefits } };
              or_query.push(obj);
          }*/
        // **********************************************
        // making user adjecives query ------------------
        // if(adjectives.length>0)
        // {
        //     let obj = { "adjectives":{ "$in": adjectives } };
        //     or_query.push(obj);
        // }
        let adjective_attribute_keys = Object.keys(adjective_attributes);
        let adj_or_query = [];
        adjective_attribute_keys.forEach(function (attribute) {
            let valid_adjectives = adjective_attributes[attribute].filter(function (adjective) {
                return priority_adjectives.indexOf(adjective)!=-1;
            });
            if(valid_adjectives.length>0){
                adj_or_query.push( {"adjectives":{ "$in":valid_adjectives }} );
            }
        });
        if(adj_or_query.length>0){
            and_query.push({"$and":adj_or_query});
        }
        // ----------------------------------------------
        // making products query ^^^^^^^^^^^^^^^^^^^^^^^^^
        let products_query = {};
        if(and_query.length>0 || or_query.length>0) {
            products_query["$and"] = [];

            if(and_query.length>0){
                products_query["$and"] = products_query["$and"].concat(and_query);
            }
            if(or_query.length>0){
                products_query["$or"] = [];
                products_query["$or"] = products_query["$or"].concat(or_query);
            }
        }
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        // making mongo query along with sort @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        let benefit_scores = all_benefits.map(function (benefit) {
            return "$new_updated_benefit_scores."+benefit+"_score";
        });
        // generating the mongo aggregation query
        let mongo_query = [
            { "$match":products_query}
        ];
        if(all_benefits.length)
        {
            let adjective_sort_query = [adjectives, "$adjectives"]
            if(adjectives.length==0)
                adjective_sort_query = [all_benefits, "$new_updated_benefit"]
            let sort_queries = [
                {
                    "$project": {
                        "es_mysql_id":1,
                        "new_updated_benefit_scores":1,
                        "pdpData.landingPageUrl":1,
                        "product_filter": 1,
                        "style_images": 1,
                        "new_updated_benefit": 1,
                        "adjectives": 1,
                        "benefit_length": {
                            "$size": {
                                "$setIntersection": [all_benefits, "$new_updated_benefit"]
                            }
                        },
                        "adjectives_length": {
                            "$size": {
                                "$setIntersection": adjective_sort_query
                            }
                        },
                        "good_to_have_score": {
                            "$add": benefit_scores
                        }
                    }
                },
                {
                    "$project": {
                        "es_mysql_id":1,
                        "new_updated_benefit_scores":1,
                        "pdpData.landingPageUrl":1,
                        "product_filter": 1,
                        "style_images": 1,
                        "new_updated_benefit": 1,
                        "adjectives": 1,
                        "good_to_have_score":1,
                        "matched_elements_length":{
                            "$add":["$benefit_length", "$adjective_length"]
                        }
                    }
                },
                { "$sort": {"matched_elements_length":-1,"good_to_have_score":-1}}
            ];
            mongo_query = mongo_query.concat(sort_queries);
        }
        return mongo_query;
    };
    let createSentence = (session_id) => {
        let user_context = SESSIONS.getContext(session_id);
        let product_line = "";
        let occasion = "";
        let broad_occasion ="";
        let filters = Object.keys(user_context["filters"]);
        let trends = false;
        let deal = false;
        let sentence = "";
        let values = [];
        for(let i in filters)
        {
            values = values.concat(user_context["filters"][filters[i]]);
        }
        if(user_context["product_line"])
            product_line = user_context["product_line"];
        if(user_context["occasion"])
            occasion = user_context["occasion"];
        if(user_context["broad_occasions"])
            broad_occasion = user_context["broad_occasions"]["key"];
        let suffix = "";
        if(occasion!=""&&product_line!="")
            suffix = occasion+" "+product_line;
        else if(broad_occasion!=""&&product_line!="")
            suffix = broad_occasion+" "+product_line;
        else
            suffix = product_line;
        console.log(user_context["trending_status"],user_context["reason_value"],values)
        if(user_context["trending_status"])
            trends = true;
        if(user_context["deal"])
            deal =  true;

        if(trends&&deal&&user_context["reason_value"]!="filters")
            sentence = "trending and deals in the list.";
        else if(trends&&user_context["reason_value"]=="trends")
            sentence = "trending "+suffix+" in the list";
        else if(deal&&user_context["reason_value"]=="deal")
            sentence = "deals in the list.";
        else if(user_context["reason_value"]=="filters")
            sentence = values.join(" ")+" "+suffix+" in the list";

        return sentence;
    };
    let getRandomNumber = (low, high)=>{
        return Math.floor(Math.random() * (high - low) + low);
    };
    let getArrayIntersection = (arr1, arr2)=>{
        return arr1.filter(function (element) {
            return arr2.indexOf(element)!=-1;
        });
    };
    let sortByBenefitLength = (result) =>
    {
        result = result.sort(function(a, b){
            return b["benefits"].length - a["benefits"].length;
        });
        return result;
    };
    let getSortProrityBenefits = (session_id) =>
    {
        let context = SESSIONS.getContext(session_id);
        let product_line = MAPPING.productLineToDbMap[context["product_line"]]
        let sort_priority_benefits =[]
        if(context["sort_type"])
        {
            if(context["sort_type"]=="priority")
            {
                sort_priority_benefits = context["sort_priority_values"].map(function(obj)
                {
                    let value = obj.value;
                    if(obj.type=="benefit")
                    {
                        let dis_names = helper_functions.getElementsDisplayName(product_line,"benefits",[value]);
                        value = dis_names [value];
                    }
                    else
                    {
                        let dis_names = helper_functions.getElementsDisplayName(product_line,"adjectives",[value]);
                        value = dis_names [value];
                    }
                    return value;
                });
            }
        }
        else
        {
            let benefit_tags = BenefitMapping[product_line];
            let priority_benefit_values = context["priority_values"]["benefits"];
            for(let ben in priority_benefit_values)
            {
                if((!context["occasion_status"] &&benefit_tags[priority_benefit_values[ben]]=="broad_occasions") || benefit_tags[priority_benefit_values[ben]]=="occasions")
                {
                    let ben_name;
                    let dis_names = helper_functions.getElementsDisplayName(product_line,"benefits",[priority_benefit_values[ben]]);
                    ben_name = dis_names[priority_benefit_values[ben]];
                    if(sort_priority_benefits.indexOf(ben_name)==-1)
                        sort_priority_benefits.push(ben_name);
                }
            }
        }
        return sort_priority_benefits;
    }
    /*
    * this function is used to make combinations of array elements
    */
    let getCombinations = (a)=>{
        let follows = (a)=>{
            return a.map((item, i)=>{
                return [item, follows(a.slice(i+1))];
            });
        };
        let combs = (prefix, trie, result)=>{
            trie.forEach((node, i)=>{
                result.push((prefix +","+ node[0]).trim());
                combs((prefix +","+ node[0]).trim(), node[1], result);
            });
            return result;
        };
        return combs('', follows(a), []);
    };
    let cartesianCombination = (arg)=> {
        let r = [], max = arg.length-1;
        function helper(arr, i) {
            for (let j=0, l=arg[i].length; j<l; j++) {
                let a = arr.slice(0);
                a.push(arg[i][j]);
                if (i==max)
                    r.push(a);
                else
                    helper(a, i+1);
            }
        }
        helper([], 0);
        return r;
    };
    let helper_functions = {
        getRecastClient : (session_id, page_id, callback)=> {
            let bot_details_query = "select bot_details.id as bot_identifier, working_status, recast_bot_details.user_slug, recast_bot_details.bot_slug, recast_bot_details.request_token, recast_bot_details.developer_token, bot_details.country from bot_details left join recast_bot_details on bot_details.recast_bot_identifier = recast_bot_details.id where bot_details.page_identifier='" + page_id + "';";
            MYSQL.sqlQuery('bot_platform', bot_details_query, function (bot_details) {
                console.log(bot_details)
                if(bot_details.length>0) {
                    let fb_bot_details = bot_details[0];
                    if (!RECAST.isRecastClientExists(session_id)) {
                        console.log(JSON.stringify(fb_bot_details, null, 2));
                        // console.log(bot_details);
                        RECAST.createRecastClient(session_id, fb_bot_details['request_token']);
                        let client = RECAST.getRecastClient(session_id);
                        callback(fb_bot_details, client);
                    }
                    else {
                        let client = RECAST.getRecastClient(session_id);
                        callback(fb_bot_details, client);
                    }
                }
                else{
                    callback({}, null);
                }
            });
        },
        sendBotMessages : (session_id) => {
            let user_context = SESSIONS.getContext(session_id);
            let bot_messages = user_context["bot_messages"].concat();
            console.log("Bot messages length : ", bot_messages.length)
            if(bot_messages.length>0) {
                user_context["context_changes"]["messages"] = bot_messages;
                user_context["previous_user_actions"].push(user_context['context_changes']);
                user_context["bot_messages"] = [];
                user_context["context_changes"] = {
                    "previous_state" : {},
                    "message" : []
                };
                user_context['question_state'] = true;
                user_context['previous_question_needed_entities'] = [];
                user_context['reason_messages'] = [];

                let recast_message = user_context['recast_message'];
                console.log(recast_message);
                SESSIONS.storeContext(session_id, user_context);
                console.log(JSON.stringify(bot_messages[bot_messages.length-1], null, 2));

                recast_message.addReply(bot_messages)
                recast_message.reply().then(p => console.log("message sent"))
            }
        },
        getProductCount : (user_context, callback)=>{
            let mongo_query = buildQuery(user_context);
            if(user_context.hasOwnProperty('product_line')) {
                let product_line = MAPPING.productLineToDbMap[user_context['product_line']]
                let product_query = mongo_query[0]["$match"];
                console.log(JSON.stringify(product_query, null, 2));
                MONGO.getCountQuery('product_data',product_line, product_query, (number_of_docs, error)=>{
                    callback(number_of_docs)
                });
            } else{
                callback(0);
            }
        },
        getAdjectiveQuestion : (user_context, question_name, callback)=>{
            let product_line = MAPPING.productLineToDbMap[user_context['product_line']];
            let question_object = JSON.parse(JSON.stringify(AdjectiveQuestionFlow[product_line][question_name]));
            let question_options = JSON.parse(JSON.stringify(question_object["options"]));
            let require_options = Object.keys(question_options).filter(function (option) {
                if(question_object["options"][option]['next_questions'].length==0)
                    return true;
                let next_questions = question_object["options"][option]['next_questions'].filter(function (name_of_question) {
                    let next_question_object = JSON.parse(JSON.stringify(AdjectiveQuestionFlow[product_line][name_of_question]));
                    return !user_context['filters'].hasOwnProperty(next_question_object['attribute']);
                });
                return next_questions.length>0 && question_object["options"][option]['type']!='skip';
            });

            if(question_name != 'customize') {
                let getCount = (user_context_copy)=>{
                    let mongo_query = buildQuery(user_context_copy);
                    let product_query = mongo_query[0]["$match"];
                    return new Promise((revolve, reject)=>{
                        MONGO.getCountQuery('product_data',product_line, product_query, (number_of_docs, error)=>{
                            if(!error) {
                                revolve(number_of_docs);
                            }
                            else
                                reject(error);
                        });
                    });
                };
                let promises_map = require_options.map(function (option) {
                    let user_context_copy = JSON.parse(JSON.stringify(user_context));
                    let option_data = question_options[option];
                    let attribute = question_object['attribute'];
                    let entity_key_type = option_data['type'];
                    let backend_key = option_data['backend_key'];
                    if(backend_key && backend_key!="") {
                        if (entity_key_type == 'adjective') {
                            user_context_copy["adjectives"].push(backend_key);
                            if (!user_context_copy['adjective_attributes'].hasOwnProperty(attribute))
                                user_context_copy['adjective_attributes'][attribute] = [];
                            user_context_copy['adjective_attributes'][attribute].push(backend_key);
                        }
                        else if (entity_key_type == 'benefit') {
                            user_context_copy['benefits'].push(backend_key);
                        }
                        else if (entity_key_type == 'attribute_value') {
                            if (!user_context_copy['filters'].hasOwnProperty(attribute))
                                user_context_copy['filters'][attribute] = [];
                            user_context_copy['filters'][attribute].push(backend_key);
                        }
                    }
                    // console.log(user_context_copy['adjectives'], user_context_copy['benefits'], user_context_copy['filters']);
                    return getCount(user_context_copy);
                });
                Promise.all(promises_map).then(function(number_of_docs) {
                    console.log("Promise Result :")
                    console.log(number_of_docs);
                    let count = 0
                    question_object['options'] =  require_options.map(function (option) {
                        let product_count = number_of_docs[count];
                        let option_data = question_options[option]
                        count += 1;
                        return {
                            "value" : option,
                            "key" : option,
                            "backend_key" : option_data['backend_key'],
                            "product_count" : product_count
                        };
                    });
                    callback(question_object);
                });
            }
            else {
                question_object['options'] =  require_options.map(function (option) {
                    return {
                        "value" : option,
                        "key" : option
                    };
                });
                callback(question_object);
            }
        },
        getAttributeReason : (product_line, attribute, user_profile)=>{
            console.log("In getAttributeReason Function");
            let reason;
            if(AttributeBodyProfileMap.hasOwnProperty(product_line)) {
                let user_profile_values = ["age", "height", "skintone", "bodyshape"];

                let user_profile_keys = user_profile_values.filter(function(a){return user_profile.hasOwnProperty(a)&&user_profile[a+"_status"];});
                let profile_attribute_reasons = [];
                user_profile_keys.forEach(function(pr_value){
                    let profile_data ;
                    if(AttributeBodyProfileMap[product_line].hasOwnProperty(user_profile[pr_value]['key']))
                        profile_data = JSON.parse(JSON.stringify(AttributeBodyProfileMap[product_line][user_profile[pr_value]['key']]));
                    if(profile_data.hasOwnProperty(attribute)) {
                        if(profile_data[attribute]["reason"]!="")
                            profile_attribute_reasons.push(profile_data[attribute]);
                    }
                });
                if(profile_attribute_reasons.length>0){
                    try{
                        profile_attribute_reasons = profile_attribute_reasons.sort(function(a, b){
                            return b["priority"] - a["priority"];
                        });
                    }catch(e){}
                    reason = profile_attribute_reasons[0]["reason"];
                }
            }
            return reason;
        },
        getElementsDisplayName : (product_line, type, elements)=>{
            let mapping_obj = WordMapping[product_line][type];
            let element_obj = {};
            elements.forEach(function (value) {
                Object.keys(mapping_obj).forEach(function (main_word) {
                    let data = mapping_obj[main_word];
                    if(data['entity_key']==value) {
                        element_obj[value] = main_word;
                        return true;
                    }
                });
                if(!element_obj.hasOwnProperty(value)) {
                    element_obj[value] = value;
                }
            });
            return element_obj;
        },
        getTrendsCount : (session_id, callback) =>{
            let user_context = SESSIONS.getContext(session_id);
            let product_line = MAPPING.productLineToDbMap[user_context['product_line']]
            let mongo_query = {"trending_status":true};
            MONGO.getCountQuery("product_data", product_line ,mongo_query,function (count, error) {
                if(!error)
                    callback(count);
            });
        },
        getTrends : (session_id,callback) => {
            let user_context = SESSIONS.getContext(session_id);
            let product_line = MAPPING.productLineToDbMap[user_context['product_line']]
            let mongo_query = {"trending_status":true};
            let from  =parseInt(user_context["from"])||0;
            if(user_context.hasOwnProperty('product_line')) {
                console.log(JSON.stringify(mongo_query,null,2), product_line);
                MONGO.runQueryWithLimit('product_data',product_line, mongo_query,from,(result_set, error)=>{
                    let result = []
                    //console.log(result_set, error);
                    console.log(result_set.length);
                    if(!error)
                    {
                        for(let i in result_set)
                        {
                            let result_source = result_set[i];
                            if(result_source.hasOwnProperty("pdpData") && result_source["pdpData"].hasOwnProperty("landingPageUrl")) {
                                let source = {};
                                if(!result_source.hasOwnProperty('adjectives'))
                                    result_source['adjectives'] = [];
                                if(!result_source.hasOwnProperty('new_updated_benefit'))
                                    result_source['new_updated_benefit'] = [];
                                source["_id"] = result_source["es_mysql_id"];

                                source["priority_benefits"] = [];
                                source["product_filter"] = result_source["product_filter"];
                                source["product_filter"]["product_line"] = user_context["product_line"];
                                source["landingPageUrl"] = result_source["pdpData"]["landingPageUrl"];
                                let display_names = helper_functions.getElementsDisplayName(product_line, "benefits" , result_source["new_updated_benefit"]);
                                source["product_benefits"] = Object.keys(display_names).map(function(value){
                                    return display_names[value].split("_").join(" ");
                                });
                                display_names  = helper_functions.getElementsDisplayName(product_line, "adjectives",result_source["adjectives"])
                                display_names = Object.keys(display_names).map(function(value){
                                    return display_names[value].split("_").join(" ");
                                });
                                source["product_benefits"] = source["product_benefits"].concat(display_names);
                                source["style_images"] = result_source["style_images"];
                                source["price_drop_score"] = result_source["price_drop_score"];
                                source["min_price"] = result_source["min_price"];
                                source["avg_price"] = result_source["avg_price"];

                                source["deal"] = false;

                                if(result_source["product_filter"]["discount_percent"]>=40 && result_source.hasOwnProperty("deal"))
                                {
                                    //console.log(result_source["product_filter"]["discount_percent"]);
                                    source["deal"] = result_source["deal"];
                                }
                                // Adding the benefits and adjectives of the product which are asked by user
                                source["benefits"] = getArrayIntersection(result_source["new_updated_benefit"], []);
                                let all_display_names = helper_functions.getElementsDisplayName(product_line, "benefits",source.benefits);
                                all_display_names = Object.keys(all_display_names).map(function(value){
                                    return all_display_names[value].split("_").join(" ");
                                });
                                source["benefits"] = source["benefits"].concat(all_display_names);
                                let adj = getArrayIntersection(result_source["adjectives"], []);
                                all_display_names = helper_functions.getElementsDisplayName(product_line, "adjectives", adj);
                                adj = Object.keys(all_display_names).map(function(value){
                                    return all_display_names[value].split("_").join(" ");
                                });
                                source.benefits = source["benefits"].concat(adj);
                                source["benefit_percentage"] = Math.round((source["benefits"].length / (user_context['benefits'].length+user_context["adjective_questions_count"]))*100);
                                if(!source["benefit_percentage"])
                                    source["benefit_percentage"] = 0;
                                result.push(source);
                            }
                        }
                        callback(result);
                    }
                    else{
                        callback([]);
                    }

                });
            } else{
                callback([]);
            }
        },
        getProducts :(session_id, callback) => {
            let user_context = SESSIONS.getContext(session_id);
            let mongo_query = buildQuery(user_context);
            let skip = user_context["from"] * 60;
            if(!skip)
                skip = 0;
            let sort_priority_benefits=getSortProrityBenefits(session_id);
            if(user_context.hasOwnProperty('product_line')) {
                let product_line = MAPPING.productLineToDbMap[user_context['product_line']]
                mongo_query.push({"$limit":skip+60});
                mongo_query.push({"$skip":skip});
                console.log(JSON.stringify(mongo_query,null,2), product_line);
                MONGO.aggregationQuery('product_data',product_line, mongo_query, (result_set, error)=>{
                    let result = []
                    //console.log(result_set, error);
                    console.log(result_set.length);
                    if(!error)
                    {
                        for(let i in result_set)
                        {
                            let result_source = result_set[i];

                            let source = {};
                            if(!result_source.hasOwnProperty('adjectives'))
                                result_source['adjectives'] = [];
                            if(!result_source.hasOwnProperty('new_updated_benefit'))
                                result_source['new_updated_benefit'] = [];
                            source["_id"] = result_source["es_mysql_id"];
                            if(i>10 && i<15)
                                console.log("source id",source["_id"], result_source["es_mysql_id"]);
                            source["priority_benefits"] = sort_priority_benefits;
                            source["product_filter"] = result_source["product_filter"];
                            source["product_filter"]["product_line"] = user_context["product_line"];
                            source["landingPageUrl"] = result_source["pdpData"]["landingPageUrl"];
                            let display_names = helper_functions.getElementsDisplayName(product_line, "benefits" , result_source["new_updated_benefit"]);
                            display_names = Object.keys(display_names).map(function(value){
                                return display_names[value].split("_").join(" ");
                            });
                            source["product_benefits"] = display_names;
                            display_names  = helper_functions.getElementsDisplayName(product_line, "adjectives",result_source["adjectives"])
                            display_names = Object.keys(display_names).map(function(value){
                                return display_names[value].split("_").join(" ");
                            });
                            source["product_benefits"] = source["product_benefits"].concat(display_names);
                            source["style_images"] = result_source["style_images"];
                            source["price_drop_score"] = result_source["price_drop_score"];
                            source["min_price"] = result_source["min_price"];
                            source["avg_price"] = result_source["avg_price"];
                            source["good_to_have"] =result_source["new_updated_benefit_scores"];

                            source["deal"] = false;

                            if(result_source["product_filter"]["discount_percent"]>=40 && result_source.hasOwnProperty("deal"))
                            {
                                //console.log(result_source["product_filter"]["discount_percent"]);
                                source["deal"] = result_source["deal"];
                            }
                            // Adding the benefits and adjectives of the product which are asked by user
                            let benefits = user_context['benefits'];
                            benefits = benefits.concat(user_context["priority_values"]["benefits"]);

                            source["benefits"] = getArrayIntersection(result_source["new_updated_benefit"], benefits);
                            let all_display_names = helper_functions.getElementsDisplayName(product_line, "benefits",source.benefits);

                            source["benefits"] = Object.keys(all_display_names).map(function(value){
                                return all_display_names[value].split("_").join(" ");
                            });
                            if(i>10 && i<15)
                                console.log("source benifits",source.benefits);
                            let adj = getArrayIntersection(result_source["adjectives"], user_context["adjectives"].concat(user_context["priority_values"]["adjectives"]));
                            if(i>10 && i<15)
                                console.log("source adj",adj);
                            all_display_names = helper_functions.getElementsDisplayName(product_line, "adjectives", adj);
                            adj = Object.keys(all_display_names).map(function(value){
                                return all_display_names[value].split("_").join(" ");
                            });
                            if(i>10 && i<15)
                                console.log("adj",adj);
                            source.benefits = source["benefits"].concat(adj);
                            if(i>10 && i<15)
                                console.log("source benifits",source.benefits);
                            source["benefits_new"] = [];
                            for(i=0;i<source["benefits"].length;i++) {
                                let is_there = false;
                                for(j=0;j<source["benefits_new"];j++)
                                {
                                    if(source["benefits"][i]==source["benefits_new"][j])
                                    {
                                        is_there =true;
                                        break;
                                    }
                                }
                                if(!is_there)
                                {
                                    source["benefits_new"].push(source["benefits"][i]);
                                }
                            }
                            source["benefit_percentage"] = Math.round((source["benefits"].length / (user_context['benefits'].length+user_context["adjective_questions_count"]))*100);
                            if(!source["benefit_percentage"])
                                source["benefit_percentage"] = 0;
                            result.push(source);

                        }
                        callback(result);
                    }
                    else{
                        callback([]);
                    }

                });
            } else{
                callback([]);
            }

        },
        getRandomNumber : getRandomNumber,
        getArrayIntersection : getArrayIntersection,
        getCombinations : getCombinations,
        cartesianCombination : cartesianCombination,
        buildQuery : buildQuery,
        createSentence : createSentence
    };
    return helper_functions;
})();