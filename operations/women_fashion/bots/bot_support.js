const SESSIONS = require('../../sessions');
const MAPPING = require('../supporters/mapping');
const HELPER = require('../../helper');
const WordMapping = require('../../../public/json/word_mapping.json');
const BOT_QUESTIONS = require('../supporters/bot_questions');
const GivenTemplates = require("../../../public/json/templates.json");
const UNDO_STATE = require("../supporters/undo_state");

module.exports = (function () {
    let contains = function(needle) {
        // Per spec, the way to identify NaN is that it is not equal to itself
        var findNaN = needle !== needle;
        var indexOf;

        if(!findNaN && typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function(needle) {
                var i = -1, index = -1;

                for(i = 0; i < this.length; i++) {
                    var item = this[i];

                    if((findNaN && item !== item) || item === needle) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(this, needle) > -1;
    };

    let isEqual = function (value, other) {
        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function (item1, item2) {

            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!isEqual(item1, item2)) return false;
            }

            // Otherwise, do a simple comparison
            else {

                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;

    };
    let getBotUnderstoodTemplate =  function (entities) {
        let msg_entities = JSON.parse(JSON.stringify(entities));
        delete msg_entities["non_category_type"];
        if(msg_entities.hasOwnProperty("broad_category")){
            msg_entities["broad_category"] = msg_entities["broad_category"]['key'];
        }
        if(msg_entities.hasOwnProperty("broad_occasions")) {
            msg_entities["broad_occasions"] = msg_entities["broad_occasions"]["key"];
        }
        if(msg_entities.hasOwnProperty("occasions")) {
            msg_entities["occasions"] = msg_entities["occasions"]["key"];
        }
        if(msg_entities.hasOwnProperty("occasion_productline_map")){
            let occasion_productline_map = msg_entities['occasion_productline_map'];
            msg_entities[occasion_productline_map["type"]] = occasion_productline_map['key'];
            delete msg_entities['occasion_productline_map'];
        }
        if(msg_entities.hasOwnProperty("range"))
        {
            if(msg_entities["range"].hasOwnProperty("start")&&msg_entities["range"]["start"]) {
                if(!msg_entities.hasOwnProperty('numbers'))
                    msg_entities['numbers'] = [];
                msg_entities["numbers"].push(msg_entities["range"]["start"]);
            }
            if(msg_entities["range"].hasOwnProperty("end")&&msg_entities["range"]["end"]) {
                if(!msg_entities.hasOwnProperty('numbers'))
                    msg_entities['numbers'] = [];
                msg_entities["numbers"].push(msg_entities["range"]["end"]);
            }
            msg_entities["range"] = msg_entities["range"]["type"];
        }
        if(msg_entities.hasOwnProperty("attribute_values"))
        {
            let attribute_values = Object.keys(msg_entities["attribute_values"]).map(function(attribute){
                let attribute_values = msg_entities['attribute_values'][attribute];
                // attribute = attribute.split("_").join(" ")
                return attribute_values.join(" ");
            });
            msg_entities["attribute_values"] = attribute_values.join(" ");
        }
        if(msg_entities.hasOwnProperty("adjectives"))
        {
            msg_entities["adjectives"] = msg_entities["adjectives"].map(function(a){return a["key"];});
        }
        if(msg_entities.hasOwnProperty("body_concern"))
        {
            msg_entities["body_concern"] = msg_entities["body_concern"].map(function(a){return a["key"];});
        }
        if(msg_entities.hasOwnProperty("trends"))
        {
            msg_entities["trends"] ="trends";
        }
        if(msg_entities.hasOwnProperty("deal_status")&&msg_entities["deal_status"])
        {
            msg_entities["deals"] = "deals";
            delete msg_entities["deal_status"];
        }
        let profile_keys = ["age","height","skintone","bodyshape"];
        profile_keys.forEach(function(a){
            if(msg_entities.hasOwnProperty(a)) {
                msg_entities[a] = msg_entities[a]["key"];
            }
        });

        let templates   = GivenTemplates.concat();
        let entity_keys = Object.keys(msg_entities);
        console.log("entity keys",entity_keys);
        templates = templates.filter(function(a){
            let splited_value = a.split("<<");
            return splited_value.length==entity_keys.length+1;
        });
        for(let i in entity_keys)
        {
            let key = entity_keys[i];
            let obj_key = "<<"+key+">>";
            templates = templates.map(function(a){
                if(a.indexOf(obj_key)!=-1)
                {
                    a = a.replace(obj_key, msg_entities[key]);
                }
                return a;
            });
        }
        templates =  templates.filter(function(a){
            return a.indexOf(">>")==-1;
        });
        return templates;
    }
    let addPreviousQuestionNeededEntities = (session_id, entities)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty('previous_question_needed_entities')){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "previous_question_needed_entities");
            user_context['previous_question_needed_entities'] = entities['previous_question_needed_entities'];
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let addProductLine = (session_id, entities) =>
    {
        let user_context = SESSIONS.getContext(session_id);
        //entities having productline key in object and productline not equal to previous existed productline
        if(entities.hasOwnProperty("product_line") && entities['product_line'] != user_context["product_line"])
        {
            console.log("Found productline in message");
            if(user_context.hasOwnProperty("product_line"))
            {
                console.log("product line already existed");
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "changed_product_line");
                user_context["changed_product_line"] = entities["product_line"];
                SESSIONS.storeContext(session_id,user_context);
                return true;
            }
            else
            {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "product_line");
                user_context["product_line"] = entities["product_line"];
            }
            SESSIONS.storeContext(session_id,user_context);
            return false;
        }
    };
    let addBroadOccasion = (session_id, entities) =>
    {
        let user_context = SESSIONS.getContext(session_id);
        // checking the user message is having broad_occasion or not
        if(entities.hasOwnProperty("broad_occasions")) {
            if ((user_context["broad_occasions"] && user_context["broad_occasions"]["key"] != entities["broad_occasions"]["key"]) || !user_context.hasOwnProperty("broad_occasions")) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "broad_occasions");
                if(user_context["broad_occasions"]&&user_context["occasion"]["benefit_entity_key"])
                {
                    let prev_broad_occasion_benefit = user_context["broad_occasions"]["benefit_entity_key"];
                    if(user_context["priority_values"]["benefits"].indexOf(prev_broad_occasion_benefit)==-1){
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                        user_context["priority_values"]["benefits"].slice(user_context["priority_values"]["benefits"].indexOf(prev_occasion_benefit),1)
                    }
                }
                user_context["broad_occasions"] = entities['broad_occasions'];
                if(user_context["occasion"]) {
                    if(user_context["occasion"]&&user_context["occasion"]["benefit_entity_key"])
                    {
                        let prev_occasion_benefit = user_context["occasion"]["benefit_entity_key"];
                        if(user_context["priority_values"]["benefits"].indexOf(prev_occasion_benefit)==-1){
                            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                            user_context["priority_values"]["benefits"].slice(user_context["priority_values"]["benefits"].indexOf(prev_occasion_benefit),1)
                        }
                    }
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion");
                    delete user_context["occasion"];
                }
                if(user_context["occasion_status"]) {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_status");
                    user_context["occasion_status"] = false;
                }
                let broad_occasion_benefit = entities["broad_occasions"]["benefit_entity_key"];
                if(user_context["priority_values"]["benefits"].indexOf(broad_occasion_benefit)==-1) {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                    user_context["priority_values"]["benefits"].push(broad_occasion_benefit);

                    let product_line = MAPPING["productLineToDbMap"][user_context["product_line"]];
                    let all_display_names = HELPER.getElementsDisplayName(product_line, "benefits", [broad_occasion_benefit]);
                    let reason ='na';
                    let display_name = all_display_names[broad_occasion_benefit];
                    console.log(all_display_names);
                    if(WordMapping[product_line]["benefits"].hasOwnProperty(display_name))
                        reason = WordMapping[product_line]["benefits"][display_name]["reason"];
                    if(reason!="na" && reason!="") {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                        user_context["reason_messages"].push(reason);
                    }
                }
            }
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addOccasion = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        // checking the user message is having occasion or not
        if(entities.hasOwnProperty("occasions")) {
            if((user_context["occasion"] && user_context["occasion"]["key"] != entities["occasions"]["key"]) || !user_context.hasOwnProperty("occasion")) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion");
                if(user_context["occasion"]&&user_context["occasion"]["benefit_entity_key"])
                {
                    let prev_occasion_benefit = user_context["occasion"]["benefit_entity_key"];
                    if(user_context["priority_values"]["benefits"].indexOf(prev_occasion_benefit)==-1){
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                        user_context["priority_values"]["benefits"].slice(user_context["priority_values"]["benefits"].indexOf(prev_occasion_benefit),1)
                    }
                }
                user_context["occasion"] = entities['occasions'];

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_status");
                user_context["occasion_status"] = true;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "is_user_wants_occasion");
                user_context['is_user_wants_occasion'] = true;
                let occasion_benefit = entities["occasions"]["benefit_entity_key"];
                if(user_context["priority_values"]["benefits"].indexOf(occasion_benefit)==-1) {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                    user_context["priority_values"]["benefits"].push(occasion_benefit);
                    let product_line = MAPPING["productLineToDbMap"][user_context["product_line"]];
                    let all_display_names = HELPER.getElementsDisplayName(product_line, "benefits", [occasion_benefit]);
                    let reason ='na';
                    let display_name = all_display_names[occasion_benefit];
                    console.log(all_display_names)
                    if(WordMapping[product_line]["benefits"].hasOwnProperty(display_name))
                        reason = WordMapping[product_line]["benefits"][display_name]["reason"];
                    if(reason!="na" && reason!="") {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                        user_context["reason_messages"].push(reason);
                    }
                }
            }
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addOccasionProductLineMap = (session_id, entities) =>
    {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("occasion_productline_map")) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_productline_map");
            user_context["occasion_productline_map"] = entities["occasion_productline_map"];
            let is_productline_to_occasion = (entities["occasion_productline_map"]["values"].indexOf(user_context['product_line']));
            if(is_productline_to_occasion && user_context.hasOwnProperty('product_line')) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
                user_context["conflict_details"]["type"].push("occasion_to_productline");
                user_context["conflict_details"]["values"]["occasion_to_productline"] = {
                    "product_line" : user_context["product_line"],
                    "occasion" : entities["occasion_productline_map"]
                };
                user_context["conflict_details"]["status"] = true;
            }
            SESSIONS.storeContext(session_id,user_context);
        }
    };
    let addAttributeValue = (session_id, entities) =>
    {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("attribute_values"))
        {
            let entities_attribute_values = entities["attribute_values"];
            let attrribute_values_keys = Object.keys(entities_attribute_values);
            let context_filters_keys = Object.keys(user_context["filters"]);

            for(let i=0;i<attrribute_values_keys.length;i++) {
                let is_not_available_in_context = false;
                let is_conflict_adjective =false;
                for(let j=0;j<context_filters_keys.length;j++) {
                    if(attrribute_values_keys[i]==context_filters_keys[j]) {
                        is_not_available_in_context = true;
                        let is_equal = isEqual(entities_attribute_values[attrribute_values_keys[i]].sort(),user_context.filters[context_filters_keys[j]].sort());
                        // filter to filter conflict identification
                        if(!is_equal) {

                            let context_filter = context_filters_keys[j];
                            let attribute_filter = attrribute_values_keys[i];
                            SESSIONS.storeContext(session_id, user_context);
                            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
                            user_context = SESSIONS.getContext(session_id);

                            user_context["conflict_details"]["type"].push("filter_to_filter");
                            if(!user_context["conflict_details"]["values"].hasOwnProperty("filter_to_filter"))
                            {
                                user_context["conflict_details"]["values"]["filter_to_filter"] = {};
                                user_context["conflict_details"]["values"]["filter_to_filter"]["context_filter"] = {};
                                user_context["conflict_details"]["values"]["filter_to_filter"]["entities_filter"] = {};
                            }
                            user_context["conflict_details"]["values"]["filter_to_filter"]["context_filter"][context_filter] = user_context.filters[context_filters_keys[j]];
                            user_context["conflict_details"]["values"]["filter_to_filter"]["entities_filter"][attribute_filter] = entities_attribute_values[attrribute_values_keys[i]];
                            user_context["conflict_details"]["status"] = true;
                        }
                    }
                }
                if(!is_not_available_in_context) {
                    is_conflict_adjective = contains.call(Object.keys(user_context["adjective_attributes"]),attrribute_values_keys[i])
                    if(is_conflict_adjective) {
                        let context_adjective_key = attrribute_values_keys[i];
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
                        user_context['conflict_details']['status'] = true;
                        user_context["conflict_details"]["type"].push("adjective_to_filter");
                        if(!user_context["conflict_details"]["values"].hasOwnProperty("adjective_to_filter"))
                        {
                            user_context["conflict_details"]["values"]["adjective_to_filter"] = {};
                            user_context["conflict_details"]["values"]["adjective_to_filter"]["adjectives"] = {};
                            user_context["conflict_details"]["values"]["adjective_to_filter"]["filters"] = {};
                        }
                        user_context["conflict_details"]["values"]["adjective_to_filter"]["adjectives"][context_adjective_key] = user_context["adjective_attributes"][attrribute_values_keys[i]];
                        user_context["conflict_details"]["values"]["adjective_to_filter"]["filters"][context_adjective_key] = entities_attribute_values[attrribute_values_keys[i]];
                    }
                }
                if(!is_not_available_in_context&&!is_conflict_adjective)
                {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters");
                    user_context["filters"][attrribute_values_keys[i]] = entities_attribute_values[attrribute_values_keys[i]];
                    if(!user_context["reason_status"])
                    {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_status");
                        user_context["reason_status"] = true;
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_value");
                        user_context["reason_value"] = "filters";
                    }
                }
            }
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addTrendsStatus = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("trends")) // checking the range is in user message or not
        {
            if(!user_context["trending_status"])
            {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "trending_status");
                user_context["trending_status"] = true;
                if(!user_context["reason_status"])
                {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_status");
                    user_context["reason_status"] = true;
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_value");
                    user_context["reason_value"] = "trends";
                }
            }

        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addDealStatus = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("deal_status")) // checking the range is in user message or not
        {
            if(!user_context["deal_status"])
            {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "deal_status");
                user_context["deal_status"] = true;
                if(!user_context["reason_status"])
                {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_status");
                    user_context["reason_status"] = true;
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_value");
                    user_context["reason_value"] = "deal";
                }
            }

        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addPriceRange = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("range")) // checking the range is in user message or not
        {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "range");
            user_context["range"]["discount_price"] = entities["range"]
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addAdjectives = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("adjectives"))
        {
            let adjectives = entities["adjectives"];
            adjectives.forEach(function (adjective_data) {
                let adjective = adjective_data["entity_key"];
                let adj_attribute = adjective_data["attribute_key"];
                //for checking adjective attribute is already there in context adjective attributes array
                let is_there = contains.call(user_context["adjective_attributes"], adj_attribute);
                //for checking adjective filter conflict
                let filter_keys = Object.keys(user_context["filters"]);
                let is_conflict =  contains.call(filter_keys, adj_attribute);
                //if not there in context and no conflict for adding this adjective attribute
                if(!is_there && !is_conflict)
                {
                    if(user_context["priority_values"]["adjectives"].indexOf(adjective)==-1)
                    {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                        user_context["priority_values"]["adjectives"].push(adjective);
                    }
                    if(!user_context.adjective_attributes.hasOwnProperty(adj_attribute)) {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_attributes");
                        user_context["adjective_attributes"][adj_attribute] = [];
                    }

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_attributes");
                    user_context["adjective_attributes"][adj_attribute].push(adjective);
                }
                else if(is_conflict)//if conflict is there
                {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
                    user_context["conflict_details"]["type"].push("adjective_to_filter");
                    if(!user_context["conflict_details"]["values"].hasOwnProperty("adjective_to_filter"))
                    {
                        user_context["conflict_details"]["values"]["adjective_to_filter"] = {};
                        user_context["conflict_details"]["values"]["adjective_to_filter"]["adjective"] = {};
                        user_context["conflict_details"]["values"]["adjective_to_filter"]["filter"] = {};
                    }
                    user_context["conflict_details"]["values"]["adjective_to_filter"]["adjective"][adj_attribute] = adjective_data;
                    user_context["conflict_details"]["values"]["adjective_to_filter"]["filter"][adj_attribute] = user_context["filters"][adj_attribute];
                }
            });
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let addUserProfile = (session_id, entities) => {
        let user_profile = ["age","height","skintone","bodyshape"];
        let user_context = SESSIONS.getContext(session_id);

        user_profile.forEach(function(profile_value){
            if(entities.hasOwnProperty(profile_value))
            {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"][profile_value+"_status"] = true;
                user_context["user_profile"][profile_value] = entities[profile_value];

                let benefit_key = entities[profile_value]["entity_key"];
                let reason = entities[profile_value]["reason"];
                if(user_context['unanswered_question']==profile_value+"Question"){
                    let index = user_context['benefits'].indexOf(benefit_key);
                    if(index==-1) {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
                        user_context['benefits'].push(benefit_key);
                    }
                }
                else{
                    let index = user_context["priority_values"]['benefits'].indexOf(benefit_key);
                    if(index==-1) {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                        user_context["priority_values"]['benefits'].push(benefit_key);
                    }
                }
                if(reason!="na" && reason!="") {
                    if(user_context["reason_messages"].length==0)
                    {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "no_display_count");
                        user_context["no_display_count"] = true;
                    }
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                    user_context["reason_messages"].push(reason);
                }
            }
        });
        SESSIONS.storeContext(session_id,user_context)
    };
    let addBodyConcerns = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);

        if(entities.hasOwnProperty("body_concern")) {
            let body_concerns = entities["body_concern"];
            if(user_context["user_profile"].hasOwnProperty("body_concerns") && user_context["user_profile"]["body_concerns"])
            {
                body_concerns.forEach(function (body_concern) {
                    let is_there_already = contains.call(user_context["body_concerns"], body_concern);
                    if(!is_there_already) {
                        let benefit_key = entities["body_concern"]["benefit_key"];
                        if(user_context['unanswered_question']=="bodyConcernQuestion"){
                            let index = user_context['benefits'].indexOf(benefit_key);
                            if(index==-1) {
                                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
                                user_context['benefits'].push(benefit_key);
                            }
                        }
                        else{
                            let index = user_context["priority_values"]['benefits'].indexOf(benefit_key);
                            if(index==-1) {
                                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                                user_context["priority_values"]['benefits'].push(benefit_key);
                            }
                        }
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                        user_context["user_profile"]["body_concerns"].push(body_concern);

                    }
                });
            }
            else {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                if(!user_context["user_profile"]["concern_status"]) {
                    user_context["user_profile"]["concern_status"] = true;
                }
                user_context["user_profile"]["body_concerns"] = entities["body_concerns"];
            }
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addNonCategoryEntities = (session_id, entities) => {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty("non_category_type")) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "non_category_type");
            user_context["non_category_type"] = entities["non_category_type"];
        }
        SESSIONS.storeContext(session_id,user_context);
    };
    let addBotUnderStoodMessage = (session_id, user_entities, cleaned_message, user_message) => {
        if(user_entities.hasOwnProperty("bot_understood_status") && !user_entities.hasOwnProperty('non_category_type')) {
            let user_context = SESSIONS.getContext(session_id);
            let entities = JSON.parse(JSON.stringify(user_entities));

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "bot_understood_status");
            delete entities['bot_understood_status'];

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "already_existed_product_line_status");
            delete entities["already_existed_product_line_status"];

            let templates = getBotUnderstoodTemplate(entities);
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "bot_understood_details");
            if(templates.length>0) {
                user_context["bot_understood_details"]["message"] = templates[0];
                user_context["bot_understood_details"]["status"] = true;
                user_context['bot_understood_details']['some_identified_message_status'] = false;
                if(cleaned_message.length>0) {
                    user_context['bot_understood_details']['some_identified_message_status'] = true;
                }
            }  else {
                user_context["bot_understood_details"]["status"] = false;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkForBroadCategoryConflict = (session_id, broad_category, product_line)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(broad_category['product_lines'].indexOf(product_line)==-1){
            let conflict_name = 'broad_category_to_product_line';
            if(user_context['conflict_details']['type'].indexOf(conflict_name)==-1) {
                //user_context['conflict_details']['status'] = true;
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
                user_context['conflict_details']['type'].push(conflict_name);
                user_context['conflict_details']['values'][conflict_name] = {
                    "broad_category" : broad_category,
                    "product_line" : product_line
                }
            }
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let addBroadCategoryEntities = (session_id, entities)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(entities.hasOwnProperty('broad_category')){
            if(entities.hasOwnProperty('product_line')) {
                let broad_category_details = entities['broad_category'];
                let product_line = entities['product_line'];
                checkForBroadCategoryConflict(session_id, entities['broad_category'], product_line);
            } else {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "broad_category");
                user_context['broad_category'] = entities['broad_category'];
                user_context['broad_category']['is_checked'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
        }
    };
    let bot_support = {
        addEntitiesToContext : (session_id, user_message, entities, remaining_message) => {
            let user_context = SESSIONS.getContext(session_id);
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "current_entities");
            user_context['current_entities'] = entities;
            SESSIONS.storeContext(session_id, user_context);
            //length of entities object == 0.no entities found message to user
            if(Object.keys(entities).length==0) {
                let no_entities_message;
                if(!user_context["not_text_message"])
                    no_entities_message = BOT_QUESTIONS.noEntitiesMessage();
                else {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "not_text_message");
                    delete user_context["not_text_message"];
                }
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "no_entities_status");
                user_context["no_entities_status"] = true;
                user_context["bot_messages"].push(no_entities_message);
                SESSIONS.storeContext(session_id,user_context);
                return;
            }
            else if(entities.hasOwnProperty("product_line_not_included"))//if no product
            {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "product_line_not_included");
                user_context["product_line_not_included"] = true;
                SESSIONS.storeContext(session_id,user_context);
                return;
            }
            else//adding entities to context
            {
                addBotUnderStoodMessage(session_id, entities, remaining_message, user_message);
                user_context = SESSIONS.getContext(session_id);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "no_entities_status");
                user_context["no_entities_status"] = false;
                SESSIONS.storeContext(session_id, user_context);
                let status = addProductLine(session_id,entities);//adding product line to context
                if(!status)
                {
                    addBroadOccasion(session_id, entities);//adding broad occasion to context
                    addOccasion(session_id, entities);//adding occasion to context
                    addOccasionProductLineMap(session_id, entities);//adding occasion product line mapping to context
                    addAttributeValue(session_id, entities);//adding attribute values to context
                    addPriceRange(session_id, entities);//adding price range to context
                    addTrendsStatus(session_id, entities);
                    addDealStatus(session_id, entities);
                    addAdjectives(session_id, entities);//adding adjectives to context
                    addNonCategoryEntities(session_id, entities);//adding non category entities to context
                    addUserProfile(session_id, entities);//add user profile (age,skintone etc) to context
                    addBodyConcerns(session_id,entities);//add body concerns to context
                    addPreviousQuestionNeededEntities(session_id, entities);
                    addBroadCategoryEntities(session_id, entities);
                }
            }
        }
    }
    return bot_support;
})();