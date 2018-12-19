const SESSIONS = require('../../sessions');
const BOT_QUESTIONS = require('../supporters/bot_questions');
const UNDO_STATE = require('../supporters/undo_state');
const BOT_SUPPORT = require('./bot_support');
const MAPPING = require('../supporters/mapping');
const HELPER = require('../../helper');
const FILTER_LIST = require('../supporters/filter_list');
const WordMapping = require('../../../public/json/word_mapping.json');
const AdjectiveQuestionFlow = require('../../../public/json/question_flow.json');
const MYSQL = require('../../../config/mysqlQueries.js');

module.exports = (function () {
    let resetUserChat = (session_id)=> {
        SESSIONS.clearContext(session_id);
        let user_context = SESSIONS.getContext(session_id);
        let first_message = BOT_QUESTIONS.textMessages("Your session is reset");
        user_context["bot_messages"].push(first_message);

        let after_suggestions_message = BOT_QUESTIONS.afterSuggestionsMessage();
        user_context["bot_messages"].push(after_suggestions_message);

        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
        user_context['unanswered_question'] = "suggestionsMessage";
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkForSuggestionMessage = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='suggestionsMessage'){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkChangeProductLineQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='changeProductLineQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('yes')!=-1) {
                let changed_product_line_details = JSON.parse(JSON.stringify(user_context['changed_product_line_details']));
                let bot_messages = user_context['bot_messages'];
                SESSIONS.clearContext(session_id);
                user_context = SESSIONS.getContext(session_id);
                user_context["chat_id"]--;
                SESSIONS.storeContext(session_id, user_context);

                console.log("Changed productline details : ");
                console.log(changed_product_line_details);
                let entities = changed_product_line_details['entities'];
                delete entities['bot_understood_status'];
                let user_message = changed_product_line_details['user_message'];
                BOT_SUPPORT.addEntitiesToContext(session_id, user_message, entities,  "");
            }
            else if(previous_question_needed_entities.indexOf('no')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "changed_product_line");
                delete user_context['changed_product_line'];
                SESSIONS.storeContext(session_id, user_context);
            }
        }
    };
    let checkResetQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='resetQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('yes')!=-1) {
                resetUserChat(session_id);
            } else if(previous_question_needed_entities.indexOf('no')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;
            }
        }
    };
    let checkOccasionProductLineQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='occasionProductlineQuestion') {

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question']=undefined;
        }
    };
    let checkForOccasionProductLineMap = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        console.log(user_context.hasOwnProperty('occasion_productline_map'));
        if(user_context.hasOwnProperty('occasion_productline_map') && !user_context['occasion_productline_map']['is_checked']) {
            let product_lines = user_context['occasion_productline_map']['values'];
            let occasion_name = user_context['occasion_productline_map']['key'];
            let productline_question = BOT_QUESTIONS.occasionProductlineQuestion(occasion_name, product_lines);
            user_context['bot_messages'].push(productline_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'occasionProductlineQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkBroadCategoryQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='broadCategoryQuestion' && user_context.hasOwnProperty('product_line')) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "broad_category");
            user_context['broad_category']['is_checked'] = true;
        }
    };
    let checkForBroadCategory = (session_id)=> {
        checkBroadCategoryQuestion(session_id);
        let user_context = SESSIONS.getContext(session_id);
        if(user_context.hasOwnProperty('broad_category') && !user_context['broad_category']['is_checked']){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'broadCategoryQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
        }
        if(user_context['unanswered_question']=='broadCategoryQuestion') {
            let broad_category = user_context['broad_category']['key'];
            let product_lines = user_context['broad_category']['product_lines'];
            let broad_category_question = BOT_QUESTIONS.occasionProductlineQuestion(broad_category, product_lines);
            user_context['bot_messages'].push(broad_category_question);
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkSomeIndentifiedMessage = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='someIndentifiedMessage') {
            let previous_question_needed_entities = user_context["previous_question_needed_entities"];
            let previous_state_values = user_context['context_changes']['previous_state'];
            UNDO_STATE.updatePreviousState(session_id, previous_state_values);
            user_context = SESSIONS.getContext(session_id);

            let bot_understood_details = user_context['bot_understood_details'];
            console.log("Previous Question Needed Entities : ",previous_question_needed_entities);
            if (previous_question_needed_entities.indexOf('yes') !=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']= undefined;

                SESSIONS.storeContext(session_id, user_context);
                BOT_SUPPORT.addEntitiesToContext(session_id, bot_understood_details.message, bot_understood_details.entities, "");
            } else if(previous_question_needed_entities.indexOf('no') !=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']= undefined;

                let ask_product_line = BOT_QUESTIONS.askProductLineMessage();
                user_context['bot_messages'].push(ask_product_line);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
        }
    };
    let checkOccasionConflictQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);

        if((user_context['unanswered_question']=='occasionConflictQuestion' || user_context['unanswered_question']=='occasionProductlineQuestion') && (user_context['current_entities'].hasOwnProperty('product_line') || user_context['current_entities'].hasOwnProperty('occasion_productline_map'))) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question']= undefined;

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
            delete user_context['conflict_details']['values']['occasion_to_productline'];
            let index = user_context['conflict_details']['type'].indexOf('occasion_to_productline');
            user_context['conflict_details']['type'].splice(index, 1);
            if(user_context['conflict_details']['type'].length==0)
                user_context['conflict_details']['status'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkFilterConflictQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);

        if(user_context['unanswered_question']=='filterConflictQuestion' && user_context['current_entities'].hasOwnProperty('attribute_values')) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
            delete user_context['conflict_details']['values']['filter_to_filter']
            let index = user_context['conflict_details']['type'].indexOf('filter_to_filter');
            user_context['conflict_details']['type'].splice(index, 1);
            if(user_context['conflict_details']['type'].length==0)
                user_context['conflict_details']['status'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkFilterAdjectiveConflictQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='filterAdjectiveConflictQuestion' && (user_context['current_entities'].hasOwnProperty('attribute_values') || user_context['current_entities'].hasOwnProperty('adjectives'))){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "conflict_details");
            delete user_context['conflict_details']['values']['adjective_to_filter']
            let index = user_context['conflict_details']['type'].indexOf('adjective_to_filter');
            user_context['conflict_details']['type'].splice(index, 1);
            if(user_context['conflict_details']['type'].length==0)
                user_context['conflict_details']['status'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkForOccasionFilterConflict = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        let filters = user_context['filters'];
        console.log("checkForOccasionFilterConflict",filters,user_context["conflict_details"])
        if(user_context.hasOwnProperty('product_line')) {
            if ((user_context.hasOwnProperty('occasions') || user_context.hasOwnProperty('broad_occasions')) && Object.keys(filters).length>0) {
                let benefit = user_context['occasions']?user_context['occasions']['benefit_entity_key']:user_context['broad_occasions']['benefit_entity_key'];
                let occasion = user_context['occasions']?user_context['occasions']['key']:user_context['broad_occasions']["key"];
                let occasion_type = user_context['occasions']?"occasions":"broad_occasions";
                FILTER_LIST.getBenefitFilterConflictDetails(MAPPING.productLineToDbMap[user_context['product_line']], benefit, filters, function (details) {
                    let conflict_attributes = [];
                    if (Object.keys(details['conflict_filters']).length > 0) {
                        let conflict_filters = details['conflict_filters'];
                        let recommended_filters = details['recommended_filters'];

                        let error_messages = Object.keys(conflict_filters).map(function (attribute) {
                            return conflict_filters[attribute].join(",")+" "+attribute;
                        });
                        let recommend_messages = Object.keys(recommended_filters).map(function (attribute) {
                            return recommended_filters[attribute].join(",")+" "+attribute;
                        });
                        conflict_attributes = Object.keys(conflict_filters);
                        let sentence = "Oops, you have gone for "+error_messages.join(" and ")+". But I recommend you to go for "+recommend_messages.join(" ")
                            +". These are suitable for "+occasion;
                        let filter_occasion_conflict_message = BOT_QUESTIONS.textMessages(sentence);
                        user_context['bot_messages'].push(filter_occasion_conflict_message);
                    }
                    else {
                        conflict_attributes = Object.keys(filters);
                        let no_products_message = BOT_QUESTIONS.textMessages("Oops, I didn't find anything suiting " + occasion + " from your selected list. I can recommend a different list for " + occasion + ".");
                        user_context["bot_messages"].push(no_products_message);
                    }
                    let filter_occasion_conflict_question = BOT_QUESTIONS.filterOccasionConflictQuestion();
                    user_context["bot_messages"].push(filter_occasion_conflict_question);

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context['unanswered_question'] = "filterOccasionConflictQuestion";
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filter_occasion_conflict_details");
                    user_context['filter_occasion_conflict_details'] = {
                        "conflict_attributes": conflict_attributes,
                        "type" : occasion_type,
                        "occasion":occasion
                    };
                    SESSIONS.storeContext(session_id, user_context);
                    HELPER.sendBotMessages(session_id);
                });
            }
            else {
                let no_products_message = BOT_QUESTIONS.noProductFoundMessage();
                user_context['bot_messages'].push(no_products_message);
                let check_trends = BOT_QUESTIONS.checkTrendsQuestion(session_id);
                user_context['bot_messages'].push(check_trends);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = "trendsQuestion";
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
                HELPER.sendBotMessages(session_id);
            }
        }
    };
    let checkFilterOccasionConflictQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='filterOccasionConflictQuestion'){
            let previous_question_needed_entitis = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entitis.indexOf("recommended")!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;
                let filter_occasion_conflict_details = user_context['filter_occasion_conflict_details'];

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters");
                filter_occasion_conflict_details['conflict_attributes'].forEach(function (attribute) {
                    delete user_context['filters'][attribute];
                });
            }
            else if(previous_question_needed_entitis.indexOf("my_likes")!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                let filter_occasion_conflict_details = user_context['filter_occasion_conflict_details'];
                let type = filter_occasion_conflict_details['type'];
                let occasion = filter_occasion_conflict_details['occasion'];
                let index_value = user_context['priority_values']['benefits'].indexOf(user_context[type]['benefit_entity_key']);
                if(index_value!=-1) {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                    user_context['priority_values']['benefits'].splice(index_value, 1);
                }
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, type);
                delete user_context[type]
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkConflictFunctions = {
        occasion_to_productline : (session_id, conflict_data)=>{
            let user_context = SESSIONS.getContext(session_id);
            let product_line = conflict_data['product_line'];
            let occasion = conflict_data['occasion']['key'];

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "product_line");
            delete user_context['product_line'];

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_productline_map");
            delete user_context['occasion_productline_map'];

            let conflict_message = BOT_QUESTIONS.occasionConflictQuestionText(product_line, occasion);
            user_context["bot_messages"].push(conflict_message);
            let conflict_question = BOT_QUESTIONS.occasionConflictQuestionButton(product_line, occasion);
            user_context["bot_messages"].push(conflict_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context["unanswered_question"] = 'occasionConflictQuestion';
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        },
        filter_to_filter : (session_id, conflict_data)=>{
            let user_context = SESSIONS.getContext(session_id);
            let context_filters = conflict_data['context_filter'];
            let entity_filters = conflict_data["entities_filter"];
            let product_line = user_context['product_line'];
            let all_values = [];
            Object.keys(context_filters).forEach(function (attribute) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters");
                delete user_context["filters"][attribute];
                let single_attribute_values = [];
                context_filters[attribute].forEach(function (value) {
                    if(single_attribute_values.indexOf(value)==-1)
                        single_attribute_values.push(value);
                });
                entity_filters[attribute].forEach(function (value) {
                    if(single_attribute_values.indexOf(value)==-1)
                        single_attribute_values.push(value);
                });
                let combinations = HELPER.getCombinations(single_attribute_values);
                combinations = combinations.map(function (a) {
                    a = a.replace(',',' ');
                    return a.split(',').join(' or ').trim();
                });
                all_values.push(combinations);
            });
            let attribute_data_combinations = HELPER.cartesianCombination(all_values);
            console.log(attribute_data_combinations);
            attribute_data_combinations = attribute_data_combinations.map(function(val){
                return val.join(' and ')+" "+product_line;
            });
            let filter_message = BOT_QUESTIONS.sendQuickRepliesMessage("Do you need", attribute_data_combinations);
            user_context['bot_messages'].push(filter_message);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'filterConflictQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        },
        adjective_to_filter : (session_id, conflict_data)=>{
            let user_context = SESSIONS.getContext(session_id);
            let adjectives = conflict_data['adjectives'];
            let filters = conflict_data["filters"];
            let product_line = user_context['product_line'];
            let all_values = [];
            Object.keys(adjectives).forEach(function (attribute) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters");
                delete user_context["filters"][attribute];
                user_context['adjective_attributes'][attribute].forEach(function (adjective) {
                    let index_value1 = user_context['priority_values']['adjectives'].indexOf(adjective);
                    if(index_value1!=-1){
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "priority_values");
                        user_context['priority_values']['adjectives'].splice(index_value1, 1);
                    }
                    let index_value2 = user_context['adjectives'].indexOf(adjective);
                    if(index_value2!=-1){
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjectives");
                        user_context['adjectives'].splice(index_value2, 1);
                    }
                });
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_attributes");
                delete user_context['adjective_attributes'][attribute];
                let single_attribute_values = [];
                let adjective_display_names = HELPER.getElementsDisplayName(MAPPING.productLineToDbMap[product_line], 'adjectives', adjectives[attribute]);
                adjectives[attribute].forEach(function (value) {
                    if(single_attribute_values.indexOf(adjective_display_names[value])==-1)
                        single_attribute_values.push(adjective_display_names[value]);
                });
                filters[attribute].forEach(function (value) {
                    if(single_attribute_values.indexOf(value)==-1)
                        single_attribute_values.push(value);
                });
                let combinations = HELPER.getCombinations(single_attribute_values);
                combinations = combinations.map(function (a) {
                    a = a.replace(',',' ');
                    return a.split(',').join(' or ').trim();
                });
                all_values.push(combinations);
            });
            let attribute_data_combinations = HELPER.cartesianCombination(all_values);
            console.log(attribute_data_combinations);
            attribute_data_combinations = attribute_data_combinations.map(function(val){
                return val.join(' and ')+" "+product_line;
            });
            let filter_message = BOT_QUESTIONS.sendQuickRepliesMessage("Do you need", attribute_data_combinations);
            user_context['bot_messages'].push(filter_message);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'filterAdjectiveConflictQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        },
        broad_category_to_product_line : (session_id, conflict_data)=>{
            let user_context = SESSIONS.getContext(session_id);
        }
    };
    let checkFiltersQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='filtersQuestion') {
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('no')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters_status");
                user_context['filters_status'] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkOccasionStatusQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='occasionStatusQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('yes')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']=undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "is_user_wants_occasion");
                user_context['is_user_wants_occasion'] = true;
            }
            else if(previous_question_needed_entities.indexOf('no')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']=undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "is_user_wants_occasion");
                user_context['is_user_wants_occasion'] = true;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_status");
                user_context['occasion_status'] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkOccasionQuestion = (session_id)=> {
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='occasionQuestion' && (user_context['current_entities'].hasOwnProperty('occasions') || user_context['current_entities'].hasOwnProperty('previous_question_needed_entities'))){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_status");
            user_context['occasion_status'] = true;
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if (previous_question_needed_entities.indexOf('skip') == -1) {
                let continue_chat_question = BOT_QUESTIONS.continueStatusQuestion(session_id);
                user_context["bot_messages"].push(continue_chat_question);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = 'continueChatQuestion';

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
            }
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkBroadOccasionQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='broadOccasionQuestion' && (user_context['current_entities'].hasOwnProperty('broad_occasions') || user_context['current_entities'].hasOwnProperty('previous_question_needed_entities'))){
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;

            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if (previous_question_needed_entities.indexOf('skip') == -1) {
                let continue_chat_question = BOT_QUESTIONS.continueStatusQuestion(session_id);
                user_context["bot_messages"].push(continue_chat_question);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = 'continueChatQuestion';

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
            }
            else{
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "occasion_status");
                user_context['occasion_status'] = true;
            }
        }
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkContinueChatQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='continueChatQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('continue')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkProfileInterestQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='profileInterestQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('yes')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']=undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['want_profile_status'] = true;
            }
            else if(previous_question_needed_entities.indexOf('no')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question']=undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['want_profile_status'] = true;
                user_context['user_profile']['profile_status'] = true;
                user_context['user_profile']['concern_status'] = true;
                let product_list_reason_message = BOT_QUESTIONS.productListReasonMessage(user_context["username"],user_context["user_profile"]);
                user_context["bot_messages"].push(product_list_reason_message);
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkUserWantsBodyProfile = (session_id)=>{
        checkProfileInterestQuestion(session_id);
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['want_profile_status']){
            let yes_or_no_question = BOT_QUESTIONS.yesOrNoQuestion("Ok! I can make better recommendations if I know your Body Profile. Shall I proceed?");
            user_context["bot_messages"].push(yes_or_no_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context["unanswered_question"]="profileInterestQuestion";

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id,user_context);
        }
    };

    let checkForTrendsQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='trendsQuestion' && user_context['current_entities'].hasOwnProperty("previous_question_needed_entities")){
            let previous_question_needed_entities = user_context['current_entities']['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf("feedback")!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;
                let feedback_question = BOT_QUESTIONS.feedBackQuestion();
                user_context['bot_messages'].push(feedback_question);
                user_context['unanswered_question'] = "feedbackQuestion";
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
        }
    };
    let checkForFeedbackQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context["unanswered_question"]=="takeFeedback")
        {
            let user_feedback = user_context["user_message"];
            let user_time = new Date().getTime();
            let insert_query = "insert into feedback (session_identifier,message,timestamp) values( '"+session_id+"','"+user_feedback+"','"+user_time+"' );";
            MYSQL.sqlQuery("bot_platform",insert_query,function(result){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"] = undefined;
                let thanksMessage = BOT_QUESTIONS.textMessages("Thanks for your feedback");
                user_context['bot_messages'].push(thanksMessage);
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            })
        }
        else if(user_context['unanswered_question']=='feedbackQuestion' && user_context['current_entities'].hasOwnProperty("previous_question_needed_entities")) {
            let previous_question_needed_entities = user_context['current_entities']['previous_question_needed_entities'];
            if (previous_question_needed_entities.indexOf("others") != -1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"] = "takeFeedback";
                let ask_feedback = BOT_QUESTIONS.textMessages("Kindly message me your feedback");
                user_context["bot_messages"].push(ask_feedback);
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
            else if(previous_question_needed_entities.indexOf("loved it") != -1||previous_question_needed_entities.indexOf("bad") != -1){
                let user_feedback = previous_question_needed_entities[0];
                let user_time = new Date().getTime();
                let insert_query = "insert into feedback (session_identifier,message,timestamp) values( '"+session_id+"','"+user_feedback+"','"+user_time+"' );";
                MYSQL.sqlQuery("selekt_fb_bot",insert_query,function(result){
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context["unanswered_question"] = undefined;
                    let thanksMessage = BOT_QUESTIONS.textMessages("Thanks for your feedback");
                    user_context['bot_messages'].push(thanksMessage);
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;
                    SESSIONS.storeContext(session_id, user_context);
                })

            }
        }
    };
    let checkAgeQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        console.log("unanswered_question",user_context['unanswered_question'],user_context['current_entities']);
        if(user_context['unanswered_question']=='ageQuestion' && user_context['current_entities'].hasOwnProperty('number')) {
            let product_line = MAPPING["productLineToDbMap"][user_context['product_line']];
            let age_value = user_context['current_entities']['number'];
            console.log("age_value",age_value);
            let age_profile_value;
            if(age_value>=18 && age_value<=27) age_profile_value = "18-27";
            else if(age_value>=28 && age_value<=38) age_profile_value = "28-38";
            else if(age_value>=39 && age_value<=80) age_profile_value = "39+";
            if(age_profile_value) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["age_status"] = true;
                user_context["user_profile"]["ageInYears"] = age_value;
                let age_benefit = WordMapping[product_line]["age"][age_profile_value]["entity_key"];
                if(age_benefit && age_benefit!="") {
                    if(user_context["benefits"].indexOf(age_benefit)==-1) {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
                        user_context["benefits"].push(age_benefit);
                    }
                }
                user_context["user_profile"]["age"] = WordMapping[product_line]["age"][age_profile_value];
                user_context["user_profile"]["age"]['key'] = age_profile_value;
                console.log("Age",user_context["user_profile"]["age"]);
                let reason = user_context["user_profile"]["age"]["reason"];
                if(reason!="na" && reason!="") {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "no_display_count");
                    user_context["no_display_count"] = true;
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                    user_context["reason_messages"].push(reason);
                }
            }
            else {
                let not_understood_message = BOT_QUESTIONS.textMessages("I didn't get that! Enter a number between 18 and 80");
                user_context["bot_messages"].push(not_understood_message);
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkAgeStatus = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['age_status']){
            if(user_context['unanswered_question']!='userProfileStatusQuestion') {
                let sentence = "Great! I will ask 5 questions about you.";
                if (user_context['user_profile']['not_me_status']) {
                    sentence = "Oh, ok. Kindly answer these 5 questions about yourself. This will help me understand you better.";
                }
                let profile_info_message = BOT_QUESTIONS.textMessages(sentence);
                user_context['bot_messages'].push(profile_info_message);
                SESSIONS.storeContext(session_id, user_context);
            }
            let age_question = BOT_QUESTIONS.bodyProfileAgeQuestion(user_context['username']);
            user_context['bot_messages'].push(age_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'ageQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkHeightQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='heightQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('skip')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["height_status"] = true;
            }
            else if(user_context['current_entities'].hasOwnProperty('height')){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["height_status"] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkHeightStatus = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['height_status']){
            let height_question = BOT_QUESTIONS.bodyProfileHeightQuestion();
            user_context['bot_messages'].push(height_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'heightQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkSkintoneQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='skintoneQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('skip')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["skintone_status"] = true;
            }
            else if(user_context['current_entities'].hasOwnProperty('skintone')){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["skintone_status"] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkSkintoneStatus = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['skintone_status']){
            let skintone_question = BOT_QUESTIONS.bodyProfileSkinTone();
            user_context['bot_messages'].push(skintone_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'skintoneQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkBodyshapeQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='bodyshapeQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('skip')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["bodyshape_status"] = true;
                user_context["user_profile"]['profile_status'] = true;
            }
            else if(user_context['current_entities'].hasOwnProperty('bodyshape')) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context["user_profile"]["bodyshape_status"] = true;
                user_context["user_profile"]['profile_status'] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkBodyshapeStatus = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['bodyshape_status']){
            let body_shape_message = BOT_QUESTIONS.bodyProfileShapeMessage();
            user_context['bot_messages'].push(body_shape_message);
            let body_shape_question = BOT_QUESTIONS.bodyProfileShapeQuestion()
            user_context['bot_messages'].push(body_shape_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = 'bodyshapeQuestion';

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkUserProfileStatusQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='userProfileStatusQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            console.log(previous_question_needed_entities);
            if(previous_question_needed_entities.indexOf('its_me')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['profile_status'] = true;
                user_context['user_profile']['concern_status'] = true;
                let profile_values = ['age', 'height', 'skintone', 'bodyshape'];

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                profile_values.forEach(function (value) {
                    let profile_data = user_context['user_profile'][value];
                    if(profile_data['entity_key'] && profile_data['entity_key']!="")
                        user_context['benefits'].push(profile_data['entity_key']);
                    if(profile_data['reason'] && profile_data['reason']!="" && profile_data['reason']!="na")
                        user_context['reason_messages'].push(profile_data['reason']);
                    user_context['user_profile'][value+"_status"] = true;
                });
                let thaksMessage = BOT_QUESTIONS.productListReasonMessage(user_context["username"],user_context["user_profile"]);
                user_context["bot_messages"].push(thaksMessage);
            }
            else if(previous_question_needed_entities.indexOf('not_me')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['profile_status'] = false;
                user_context['user_profile']['concern_status'] = false;
                user_context['user_profile']['not_me_status'] = true;
                let profile_values = ['age', 'height', 'skintone', 'bodyshape'];
                profile_values.forEach(function (value) {
                    user_context['user_profile'][value]=undefined;
                    user_context['user_profile'][value+"_status"] = false;
                });
            }
            else if(previous_question_needed_entities.indexOf('skip')!=-1) {
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['profile_status'] = true;
                user_context['user_profile']['concern_status'] = true;
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkProfileSummary = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        let profile_info_message = BOT_QUESTIONS.profileInfoMessage();
        user_context["bot_messages"].push(profile_info_message);

        let profile_summary_question = BOT_QUESTIONS.profileSummaryQuestion(user_context["user_profile"]);
        user_context["bot_messages"].push(profile_summary_question);

        let profile_confirmation_question = BOT_QUESTIONS.profileConfirmationQuestion(user_context["user_profile"])
        user_context["bot_messages"].push(profile_confirmation_question);

        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
        user_context["unanswered_question"]="userProfileStatusQuestion";

        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
        user_context['question_state'] = false;
        SESSIONS.storeContext(session_id, user_context);
    };
    let checkBodyProfileStatus = (session_id)=>{
        checkUserProfileStatusQuestion(session_id);
        checkHeightQuestion(session_id);
        checkSkintoneQuestion(session_id);
        checkBodyshapeQuestion(session_id);

        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['profile_status']) {
            let profile_values = ["age", "height", "bodyshape", "skintone"];
            let unanswered_profile_values = profile_values.filter(function(pv){
                return !user_context["user_profile"][pv];
            });
            console.log(unanswered_profile_values);
            if(unanswered_profile_values.length>0) {
                checkAgeStatus(session_id);
                checkHeightStatus(session_id);
                checkSkintoneStatus(session_id);
                checkBodyshapeStatus(session_id);
            }
            else{
                checkProfileSummary(session_id);
            }
        }
    };

    let checkBodyConcernQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='bodyConcernQuestion') {
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('skip')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "user_profile");
                user_context['user_profile']['concern_status'] = true;
                let product_list_reason_message = BOT_QUESTIONS.productListReasonMessage(user_context["username"],user_context["user_profile"]);
                user_context["bot_messages"].push(product_list_reason_message);
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkBodyConcernStatus = (session_id)=>{
        checkBodyConcernQuestion(session_id);
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['question_state'] && !user_context['user_profile']['concern_status']) {
            let body_concerns_message = BOT_QUESTIONS.askBodyConcernsQuestion("Lastly, Any body concerns that I should be aware of?", session_id);
            user_context["bot_messages"].push(body_concerns_message);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context["unanswered_question"] = "bodyConcernQuestion";

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;
            SESSIONS.storeContext(session_id, user_context);
        }
    };

    let checkProceedFurtherQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='proceedFurtherQuestion'){
            let previous_question_needed_entities = user_context['previous_question_needed_entities'];
            if(previous_question_needed_entities.indexOf('continue')!=-1){
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context['unanswered_question'] = undefined;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "proceed_further_question_status");
                user_context['proceed_further_question_status'] = true;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_module_details");
                user_context['adjective_module_details']['status'] = true;
                user_context['adjective_module_details']["question_queue"] = ['customize'];
            }
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let checkAdjectiveModuleQuestion = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['unanswered_question']=='adjectiveModuleQuestion' && user_context['current_entities'].hasOwnProperty('adjective_module_needed_entities')){

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = undefined;
            let adjective_module_needed_values = user_context['current_entities']['adjective_module_needed_entities'];
            let product_line = MAPPING['productLineToDbMap'][user_context['product_line']];
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_module_details");
            let question_name = user_context['adjective_module_details']['question_queue'].shift();
            let question_details = JSON.parse(JSON.stringify(AdjectiveQuestionFlow[product_line][question_name]));
            let attribute = question_details['attribute'];
            adjective_module_needed_values.forEach(function (selected_value) {
                let option_data = question_details['options'][selected_value];
                let next_questions = option_data['next_questions'];


                user_context['adjective_module_details']['question_queue'] = user_context['adjective_module_details']['question_queue'].concat(next_questions);
                if(option_data['backend_key'] && option_data['backend_key']!='') {
                    if (option_data['type'] == 'adjective') {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjectives");
                        user_context['adjectives'].push(option_data['backend_key']);

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_attributes");
                        if (!user_context['adjective_attributes'].hasOwnProperty(attribute))
                            user_context['adjective_attributes'][attribute] = [];
                        user_context['adjective_attributes'][attribute].push(option_data['backend_key']);
                    }
                    else if (option_data['type'] == 'benefit') {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "benefits");
                        user_context['benefits'].push(option_data['backend_key']);
                    }
                    else if (option_data['type'] == 'attribute_value') {
                        let attribute = question_details['attribute'];

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "filters");
                        if(!user_context['filters'].hasOwnProperty(attribute))
                            user_context['filters'][attribute] = []
                        user_context['filters'][attribute].push(option_data['backend_key']);
                    }
                }
            });
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let askAdjectiveModuleQuestion = (session_id, callback)=>{
        let user_context = SESSIONS.getContext(session_id);
        let product_line = MAPPING['productLineToDbMap'][user_context['product_line']];
        let question_name = user_context['adjective_module_details']['question_queue'][0];

        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "adjective_module_details");
        user_context['adjective_module_details']['question_name'] = question_name;
        HELPER.getAdjectiveQuestion(user_context, question_name, function (adjective_question) {
            user_context["adjective_module_details"]["question"] = adjective_question;
            console.log(JSON.stringify(adjective_question, null, 2));
            if(question_name=='customize'){
                let customize_question = BOT_QUESTIONS.customizeQuestion(adjective_question,session_id);
                let customize_question_text = BOT_QUESTIONS.textMessages(adjective_question.text);
                user_context["bot_messages"].push(customize_question_text);
                user_context["bot_messages"].push(customize_question);
            }
            else {
                let attribute = adjective_question['attribute'];
                let attribute_reason = HELPER.getAttributeReason(product_line, attribute, user_context['user_profile']);
                if (attribute_reason && attribute_reason != 'na') {
                    attribute_reason = attribute_reason.charAt(0).toLowerCase() + attribute_reason.slice(1);
                    let reason_message = BOT_QUESTIONS.textMessages("I would recommend you to go "+attribute_reason);
                    user_context['bot_messages'].push(reason_message);
                }
                let send_adj_module_text = BOT_QUESTIONS.textMessages(adjective_question.text);
                user_context['bot_messages'].push(send_adj_module_text);
                let send_adj_module_question = BOT_QUESTIONS.makeAdjModuleQuestion(adjective_question, user_context["product_line"], session_id);
                user_context["bot_messages"].push(send_adj_module_question);
            }

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = "adjectiveModuleQuestion";
            SESSIONS.storeContext(session_id, user_context);
            callback();
        });
    };
    let chat_flow_functions = {
        /*
        / this object is used to handling non_category_functions
        */
        nonCategoryFunctions : {
            greet : (session_id) => {
                let continue_status = true;
                let user_context = SESSIONS.getContext(session_id);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "non_category_type");
                delete user_context['non_category_type'];
                if(user_context["unanswered_question"]=='suggestionsMessage'){
                    let hello_message = BOT_QUESTIONS.textMessages("Hello");
                    user_context["bot_messages"].push(hello_message);
                    SESSIONS.storeContext(session_id, user_context);
                    return false;
                }
                else if(user_context["unanswered_question"]!='aboutMe' && user_context["unanswered_question"]!='instructionMessage' && user_context['unanswered_question']!='welcomeBackMessage') {
                    //ask reset context question
                    let hello_message = BOT_QUESTIONS.textMessages("Hello");
                    user_context["bot_messages"].push(hello_message);
                    let ask_reset_question = BOT_QUESTIONS.askResetQuestion();
                    user_context['bot_messages'].push(ask_reset_question);

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context['unanswered_question'] = "resetQuestion";

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;
                    SESSIONS.storeContext(session_id, user_context);
                    return false;
                }
                else {
                    //ask previous question instruction questions
                    return true;
                }
            },
            undo : (session_id) => {
                let user_context = SESSIONS.getContext(session_id);
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "non_category_type");
                delete user_context['non_category_type'];
                SESSIONS.storeContext(session_id, user_context);
                //undo module calling
                UNDO_STATE.getUndoState(session_id);
                return false;
            },
            reset : (session_id) => {
                resetUserChat(session_id);
                return false;
            },
            help : (session_id) => {
                let user_context = SESSIONS.getContext(session_id);
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "non_category_type");
                delete user_context['non_category_type'];
                let help_message = BOT_QUESTIONS.textMessages("- if you want to reset/refresh your chat, just type \"clear\" \n\n- if you want to go back to the previous question type \"undo\".")
                user_context["bot_messages"].push(help_message);
                SESSIONS.storeContext(session_id, user_context);
                return true;
            },
            only_indianwear : (session_id)=> {
                let user_context = SESSIONS.getContext(session_id);
                console.log("only indian wear");
                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "non_category_type");
                delete user_context['non_category_type'];
                let no_indianwear_message = BOT_QUESTIONS.noIndianWearMessage();
                user_context["bot_messages"].push(no_indianwear_message);
                SESSIONS.storeContext(session_id, user_context);
                return false;
            }
        },
        checkAboutMe : (session_id)=> {
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['unanswered_question']=='aboutMe') {
                let previous_question_needed_entities = user_context["previous_question_needed_entities"];
                if (previous_question_needed_entities.indexOf('ok') !=-1) {
                    user_context['previous_question_needed_entities'] = [];

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context['unanswered_question'] = 'instructionMessage';

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;
                }
                else {
                    let previous_state_values = user_context['context_changes']['previous_state'];
                    UNDO_STATE.updatePreviousState(session_id, previous_state_values);
                    user_context = SESSIONS.getContext(session_id);

                    let check_suggestions_message = BOT_QUESTIONS.textMessages("Kindly complete the instructions flow and I will assist you on your needs");
                    user_context['bot_messages'].push(check_suggestions_message);
                }
            }
            if(user_context['unanswered_question']=='instructionMessage'){
                let smart_message = BOT_QUESTIONS.textMessages('I am not as smart as you are! But I am many times faster than you 😊');
                user_context['bot_messages'].push(smart_message);
                let instruction_message = BOT_QUESTIONS.okButtonQuestion("So help me understand your queries by making it simple and I will get you what you want instantly. Deal?");
                user_context["bot_messages"].push(instruction_message);
            }
            SESSIONS.storeContext(session_id, user_context);
        },
        checkInstructionMessage : (session_id)=> {
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['unanswered_question']=='instructionMessage') {
                let previous_question_needed_entities = user_context["previous_question_needed_entities"];
                if (previous_question_needed_entities.indexOf('ok') !=-1) {
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "previous_question_needed_entities");
                    user_context['previous_question_needed_entities'] = [];
                    let go_further_msg = BOT_QUESTIONS.textMessages('Great! We are good to go');
                    user_context['bot_messages'].push(go_further_msg);
                    let send_suggestions_message = BOT_QUESTIONS.sendSuggestionsMessage();
                    user_context["bot_messages"].push(send_suggestions_message);

                    let after_suggestions_message = BOT_QUESTIONS.afterSuggestionsMessage();
                    user_context["bot_messages"].push(after_suggestions_message);

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context['unanswered_question'] = 'suggestionsMessage';

                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;
                }
                else {
                    let previous_state_values = user_context['context_changes']['previous_state'];
                    UNDO_STATE.updatePreviousState(session_id, previous_state_values);
                    user_context = SESSIONS.getContext(session_id);

                    let check_suggestions_message = BOT_QUESTIONS.textMessages("Kindly complete the instructions flow and I will assist you on your needs");
                    user_context['bot_messages'].push(check_suggestions_message);
                }
            }
            SESSIONS.storeContext(session_id, user_context);
        },
        checkBotUnderstoodModule : (session_id, entities)=> {
            checkSomeIndentifiedMessage(session_id);
            let user_context = SESSIONS.getContext(session_id);
            let continue_status = true;
            if(user_context['question_state'] && entities.hasOwnProperty('bot_understood_status') && (!user_context['unanswered_question'] || user_context['unanswered_question']=='suggestionsMessage')) {
                let bot_understood_details = user_context['bot_understood_details'];
                let some_identified_message_status = bot_understood_details['some_identified_message_status'];
                if (bot_understood_details['status']) {
                    let understood_message = BOT_QUESTIONS.textMessages("I understood it as '"+bot_understood_details['message']+"'");
                    user_context['bot_messages'].push(understood_message);
                    if(some_identified_message_status) {
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "bot_understood_details");
                        user_context['bot_understood_details']['entities'] = entities;

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                        user_context['unanswered_question'] = 'someIndentifiedMessage';

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                        user_context['question_state'] = false;
                    }
                } else {
                    let not_understood_message = BOT_QUESTIONS.textMessages("Sorry, I did not understand your message. Try changing your question and please make it simpler.");
                    user_context['bot_messages'].push(not_understood_message);
                    continue_status = false;
                }
            }
            if(user_context['unanswered_question']=='someIndentifiedMessage'){
                let some_identified_message = BOT_QUESTIONS.someIdentifiedQuestion();
                user_context['bot_messages'].push(some_identified_message);
                continue_status = false;
            }
            SESSIONS.storeContext(session_id, user_context);
            return continue_status;
        },
        checkForChangedProductLine : (session_id)=>{
            let user_context = SESSIONS.getContext(session_id);
            console.log(user_context['changed_product_line']);
            if(user_context['question_state'] &&  user_context.hasOwnProperty('changed_product_line')){

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "changed_product_line_details");
                user_context['changed_product_line_details'] = {
                    "previous_product_line" : user_context['product_line'],
                    "current_product_line" : user_context['changed_product_line'],
                    "entities" : user_context['current_entities'],
                    "user_message" : user_context['user_message']
                };

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"] = 'changeProductLineQuestion';

                let change_product_line_question = BOT_QUESTIONS.changeProductLineQuestion();
                user_context['bot_messages'].push(change_product_line_question);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
            }
            SESSIONS.storeContext(session_id, user_context);
        },
        checkForProductLine : (session_id)=> {
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['question_state'] && !user_context.hasOwnProperty('product_line')){
                checkForOccasionProductLineMap(session_id);
                checkForBroadCategory(session_id);
            }
        },
        checkPreviousAskedQuestion : (session_id)=> {
            checkForSuggestionMessage(session_id);
            checkResetQuestion(session_id);
            checkBroadCategoryQuestion(session_id);
            checkOccasionProductLineQuestion(session_id);
            checkFilterOccasionConflictQuestion(session_id);
            checkChangeProductLineQuestion(session_id);
            checkAgeQuestion(session_id);
            checkAdjectiveModuleQuestion(session_id);
            checkForTrendsQuestion(session_id);
            checkForFeedbackQuestion(session_id);
        },
        checkForReasonMessages : (session_id, product_count)=> {
            let user_context = SESSIONS.getContext(session_id);
            console.log(user_context['reason_messages']);
            if((product_count>0)&&((user_context['question_state'] && product_count>0 && user_context['current_entities'].hasOwnProperty('product_line') && (!user_context.hasOwnProperty("conflict_details")&&!user_context['conflict_details']['status'])) || user_context['reason_status'] ||user_context['reason_messages'].length>0 || (user_context['current_entities'].hasOwnProperty("bot_understood_status") && !user_context.hasOwnProperty('changed_product_line')))) {
                let product_line_name = user_context['product_line'];
                let reason_prefixes = [
                    "I have chosen " + product_line_name+" with ",
                    "I curated " + product_line_name+" with ",
                    "I am showing " + product_line_name+" with "
                ];
                let reason_messages = user_context['reason_messages'].concat();
                let user_profile = ["age","height","skintone","bodyshape"];
                if (reason_messages.length > 0) {
                    let prefixes_length = reason_prefixes.length;
                    reason_messages = reason_messages.map(function (message) {
                        let random_index = HELPER.getRandomNumber(0, prefixes_length);
                        return reason_prefixes[random_index] + " " + message;
                    });
                    let sentence = "Found " + product_count + " " + product_line_name + "\n\n";
                    console.log("unanswered question",user_context["unanswered_question"]);
                    if(user_context["no_display_count"]) {
                        sentence ="";
                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "no_display_count");
                        user_context["no_display_count"] = false;
                    }
                    sentence += reason_messages.join("\n");
                    let reason_message_for_user = BOT_QUESTIONS.textMessages(sentence);
                    user_context["bot_messages"].push(reason_message_for_user);
                }
                else if(user_context["reason_status"])
                {
                    let suffix_sentence = HELPER.createSentence(session_id);
                    let sentence = "Found " + product_count + " " +suffix_sentence;
                    let reason_message_for_user = BOT_QUESTIONS.textMessages(sentence);
                    user_context["bot_messages"].push(reason_message_for_user);
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_status");
                    user_context["reason_status"] = false;
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_value");
                    user_context["reason_value"] = "";
                }
                else {

                    let sentence = "I have found " + product_count + " styles matching your request.";
                    let reason_message_for_user = BOT_QUESTIONS.textMessages(sentence);
                    user_context["bot_messages"].push(reason_message_for_user);
                }

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "reason_messages");
                user_context['reason_messages'] = [];
                SESSIONS.storeContext(session_id, user_context);
            }
        },
        checkForConflict : (session_id)=>{
            checkOccasionConflictQuestion(session_id);
            checkFilterConflictQuestion(session_id);
            checkFilterAdjectiveConflictQuestion(session_id);
            let user_context = SESSIONS.getContext(session_id);
            let conflict_details = user_context['conflict_details'];

            if(user_context['question_state'] && conflict_details.status){
                let conflict_type = conflict_details['type'][0];
                checkConflictFunctions[conflict_type](session_id, conflict_details['values'][conflict_type]);
            }
        },
        checkForLessProducts : (session_id, product_count)=>{
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['question_state']) {
                if (product_count == 0) {
                    checkForOccasionFilterConflict(session_id);
                    return false;
                }
                else if (product_count <= 30) {
                    let less_products_message = BOT_QUESTIONS.lessProducts(session_id, product_count);
                    user_context['bot_messages'].push(less_products_message);
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                    user_context['unanswered_question'] = 'trendsQuestion';
                    user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                    user_context['question_state'] = false;
                    SESSIONS.storeContext(session_id, user_context);
                    HELPER.sendBotMessages(session_id);
                    return false;
                }
                else {
                    return true;
                }
            }
            return true;
        },
        checkForFiltersStatus : (session_id)=>{
            checkFiltersQuestion(session_id);
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['question_state'] && !user_context['filters_status']) {
                let ask_filters = BOT_QUESTIONS.askFiltersQuestion(session_id);
                user_context["bot_messages"].push(ask_filters);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"] = "filtersQuestion";

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
        },
        checkForOccasion : (session_id)=>{
            checkContinueChatQuestion(session_id);
            checkOccasionStatusQuestion(session_id);
            checkOccasionQuestion(session_id);
            checkBroadOccasionQuestion(session_id);
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['question_state'] && !user_context.hasOwnProperty('broad_occasions') && !user_context['is_user_wants_occasion']) {
                let occasion_info_question = BOT_QUESTIONS.occasionInfoMessage();
                user_context["bot_messages"].push(occasion_info_question);
                let occasion_in_mind_message = BOT_QUESTIONS.yesOrNoQuestion("Do you have an occasion in mind?");
                user_context["bot_messages"].push(occasion_in_mind_message);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"]="occasionStatusQuestion";

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
            }
            else if(user_context['question_state'] && !user_context['occasion_status']) {
                if(user_context.hasOwnProperty("broad_occasions")) {
                    let broad_occasion_value = user_context["broad_occasions"]["key"];
                    let sub_occasions = user_context['broad_occasions']["occasion_map"];
                    if(sub_occasions.length>0) {
                        let occasion_question = BOT_QUESTIONS.occasionQuestion(broad_occasion_value, sub_occasions);
                        user_context["bot_messages"].push(occasion_question);

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                        user_context["unanswered_question"] = "occasionQuestion";

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                        user_context['question_state'] = false;
                    }
                }
                else {
                    let product_line = MAPPING.productLineToDbMap[user_context['product_line']];
                    let broad_occasions = WordMapping[product_line]["broad_occasions"];
                    let broad_occasion_keys = Object.keys(broad_occasions);
                    if(broad_occasion_keys.length) {
                        let broad_occasion_question = BOT_QUESTIONS.broadOccasionQuestion(user_context["product_line"], broad_occasion_keys);
                        user_context["bot_messages"].push(broad_occasion_question);

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                        user_context["unanswered_question"] = "broadOccasionQuestion";

                        user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                        user_context['question_state'] = false;
                    }
                }
            }
            SESSIONS.storeContext(session_id, user_context);
        },
        checkForBodyProfile : (session_id)=>{
            let user_context = SESSIONS.getContext(session_id);
            checkUserWantsBodyProfile(session_id);
            checkBodyProfileStatus(session_id);
            checkBodyConcernStatus(session_id);
        },
        checkForProcessFurtherStatus : (session_id)=>{
            checkProceedFurtherQuestion(session_id);
            let user_context = SESSIONS.getContext(session_id);
            if(user_context['question_state'] && !user_context['proceed_further_question_status']) {
                let further_proceed = BOT_QUESTIONS.proceedFurtherQuestion(session_id, user_context.hasOwnProperty("deals"), user_context["refine_list_status"]);
                user_context["bot_messages"].push(further_proceed);

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
                user_context["unanswered_question"] = "proceedFurtherQuestion";

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
                user_context['question_state'] = false;
                SESSIONS.storeContext(session_id, user_context);
            }
        },
        checkForAdjectiveModuleStatus : (session_id, callback)=>{
            let user_context = SESSIONS.getContext(session_id);
            if(user_context["question_state"] && user_context['adjective_module_details']["status"]){
                let question_queue = user_context['adjective_module_details']['question_queue'].concat();
                if(question_queue.length>0){
                    askAdjectiveModuleQuestion(session_id, function () {
                        callback();
                    });
                }
                else{
                    let conversation_completed_message = BOT_QUESTIONS.conversationCompleteMessage(session_id);
                    user_context["bot_messages"].push(conversation_completed_message);
                    callback();
                }
            }
            else
            {
                callback();
            }
        }
    };
    return chat_flow_functions;
})();