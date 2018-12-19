const WordMapping = require('../../../public/json/word_mapping.json');
const MessageMapping = require('../../../public/json/msg_mapping.json');
const OccasionToProductlineMap = require('../../../public/json/occasion_to_productline_map.json');
const BodyProfileMapping = require('../../../public/json/body_profile_mapping.json');
const AdjectiveQuestionFlow = require('../../../public/json/question_flow.json');
const MAPPING = require('../supporters/mapping');

module.exports = (function () {
    // this function is used to clean the message
    let cleanSentence = (message)=> {
        message = message.toLowerCase();
        // removing special characters
        message = message.replace(/[^A-Z0-9a-z]+/ig, ' ');

        // removing '-' from message
        message = message.split("-").join(" ");
        let stop_words = MAPPING.stopWords.concat();
        stop_words.forEach(function(word){
            if(message.indexOf(" "+word+" ")!=-1)
            {
                message = message.split(" "+word+" ").join(" ");
            }
            else if(message.indexOf(" "+word)!=-1 && (message.indexOf(" "+word)+word.length)==message.length-1)
            {
                message = message.replace(" "+word, "");
            }
            else if(message.indexOf(word+" ")!=-1 && message.indexOf(word)==0)
            {
                message = message.replace(word+" ","");
            }
        });
        return message;
    };
    // this function is used to identify the words in a message
    let wordIndentifier = (words, message)=>{
        // sorting the words based on their lengths in descending order
        try{
            words = words.sort(function(a,b)
            {
                return b.length - a.length;
            });
        }catch(e){}

        let require_values = [];
        for(let i in words)
        {
            let value = words[i].toLowerCase();
            let value_index = message.indexOf(value);
            if(value_index!=-1)
            {
                if(value_index==0 && (value_index+value.length)<message.length)
                {
                    if(message.charAt(value_index+value.length)==" ")
                    {
                        message = message.replace(value,"");
                        require_values.push(words[i]);
                    }
                }
                else if(value_index>0 && (value_index+value.length)==message.length)
                {
                    if(message.charAt(value_index-1)==" ")
                    {
                        message = message.replace(value,"");
                        require_values.push(words[i]);
                    }
                }
                else if(value_index==0 && (value_index+value.length)==message.length)
                {
                    message = message.replace(value,"");
                    require_values.push(words[i]);
                }
                else if(value_index>0 && (value_index+value.length)<message.length)
                {
                    if(message.charAt(value_index-1)==" " && message.charAt(value_index+value.length)==" ")
                    {
                        message = message.replace(value,"");
                        require_values.push(words[i]);
                    }
                }
            }
        }
        return { values : require_values, remaining_message : message };
    };
    let getProductLine = (message, context_product_line)=>{
        let product_lines_data = MAPPING.productLineSynonyms;
        let all_product_lines = Object.keys(product_lines_data);
        let synonyms_mapping = {};
        // generating the synonyms to product line mapping
        all_product_lines.forEach(function (product_line) {
            let synonyms = product_lines_data[product_line];
            synonyms.forEach(function (synonym) {
                synonyms_mapping[synonym] = product_line;
            });
        });
        // getting identified product lines
        let identified_data_details = wordIndentifier(Object.keys(synonyms_mapping), message);

        if(identified_data_details['values'].length==0) {
            if(context_product_line) {
                identified_data_details['product_line'] = MAPPING.productLineToDbMap[context_product_line];
            }
        }
        else{
            let identified_product_line = synonyms_mapping[identified_data_details['values'][0]];
            if(context_product_line!=identified_product_line) {
                identified_data_details['value'] = identified_product_line;
            } else {
                identified_data_details['already_existed_product_line'] = identified_product_line;
            }
            identified_data_details['product_line'] = MAPPING.productLineToDbMap[identified_product_line];
        }
        return identified_data_details;
    };
    let getProductLineRelatedEntities = (message, product_line)=>{
        let product_line_data = MessageMapping[product_line];
        let all_words = Object.keys(product_line_data);
        console.log("Length : ", all_words.length);
        let identified_words = wordIndentifier(all_words, message);
        console.log("Identifier Words Details : ",identified_words);
        let remaining_message = identified_words['remaining_message'];
        let word_entities = {};
        identified_words['values'].forEach(function (word) {
            let product_line_obj = product_line_data[word];
            let type_of_value = product_line_obj['key_name'];
            let word_belongs = product_line_obj['main_value'];
            if (type_of_value == 'attribute_values') {
                if (!word_entities.hasOwnProperty(type_of_value)) {
                    word_entities[type_of_value] = {};
                }
                let attribute_value_data = WordMapping[product_line][type_of_value][word_belongs];
                let db_key = attribute_value_data['db_key'];
                if (!word_entities[type_of_value].hasOwnProperty(db_key)) {
                    word_entities[type_of_value][db_key] = [];
                }
                word_entities[type_of_value][db_key].push(word_belongs);
            } else if(type_of_value=='body_concern' || type_of_value=='adjectives'){
                if(!word_entities.hasOwnProperty(type_of_value)){
                    word_entities[type_of_value] = [];
                }
                let mapping_value_details = WordMapping[product_line][type_of_value][word_belongs];
                mapping_value_details['key'] = word_belongs;
                delete mapping_value_details['values'];
                word_entities[type_of_value].push(mapping_value_details);
            } else {
                console.log(type_of_value, word_belongs);
                word_entities[type_of_value] = WordMapping[product_line][type_of_value][word_belongs];
                word_entities[type_of_value]['key'] = word_belongs;
                delete word_entities[type_of_value]['values'];
            }
        });
        return { "entities": word_entities, "remaining_message": remaining_message };
    };
    let getNegativeWords = (message)=>{
        let conflict_words = MAPPING.conflictWords;
        let identified_words = wordIndentifier(conflict_words, message);
        return identified_words;
    };
    let getRangeWords = (message)=>{
        let numbers_in_msg = message.match(/[-]{0,1}[\d.]*[\d]+/g);
        if(numbers_in_msg) {
            numbers_in_msg = numbers_in_msg.map(function (number) {
                let number_str = number.toString();
                let number_length = number_str.length;
                let index_of_number = message.indexOf(number_str);
                if (message[index_of_number + number_length] == 'k') {
                    message = message.split(number_str + 'k').join(' ');
                    number = number * 1000;
                }
                else {
                    message = message.split(number_str).join(' ');
                }
                return number;
            });
        }
        else{
            numbers_in_msg = [];
        }
        let range_entities = {};
        if(numbers_in_msg.length>0){
            let under_words = wordIndentifier(['under', 'below'], message);
            let above_words = wordIndentifier(['above'], under_words['remaining_message']);
            let between_words = wordIndentifier(['between', 'to'], above_words['remaining_message']);
            let all_words = [];
            if(under_words['values'].length>0)
            {
                under_words['values'].forEach(function (word) {
                    message = message.split(word).join(' ');
                });
                range_entities["range"] = {"type":"under"};
                range_entities["range"]['end'] = numbers_in_msg[0];
            }
            else if(above_words['values'].length>0)
            {
                above_words['values'].forEach(function (word) {
                    message = message.split(word).join(' ');
                });
                range_entities["range"] = {"type":"above"};
                range_entities["range"]['start'] = numbers_in_msg[0];
            }
            else if(between_words['values'].length>0 && numbers_in_msg.length>1)
            {
                between_words['values'].forEach(function (word) {
                    message = message.split(word).join(' ');
                });
                numbers_in_msg = numbers_in_msg.sort(function (a, b) {
                    return a - b;
                });
                range_entities["range"] = {"type":"between"};
                range_entities["range"]['start'] = numbers_in_msg[0];
                range_entities["range"]['end'] = numbers_in_msg[1];
            }
            else
            {
                // if(numbers_in_msg[0]>80) {
                //     range_entities["range"] = {"type": "under"};
                //     range_entities["range"]['end'] = numbers_in_msg[0];
                // }
                // else {
                //     range_entities["number"] = numbers_in_msg[0];
                // }
                range_entities["number"] = parseInt(numbers_in_msg[0]);
            }
        }
        return {"entities": range_entities, "remaining_message":message};
    };
    let getBroadCategoryEntities = (message) =>{
        let broad_category_mapping = JSON.parse(JSON.stringify(MAPPING.broadCategoryMappping));
        let synonym_words = {};
        Object.keys(broad_category_mapping).forEach(function (broad_category) {
            broad_category_mapping[broad_category]['synonyms'].forEach(function (synonym) {
                synonym_words[synonym] = broad_category;
            });
        });
        let identified_words = wordIndentifier(Object.keys(synonym_words), message);
        let identified_broad_categories = identified_words['values'].map(function (bc_synonym) {
            let broad_category = synonym_words[bc_synonym];
            let broad_category_details = broad_category_mapping[broad_category];
            delete broad_category_details['synonyms'];
            broad_category_details['key'] = broad_category;
            return broad_category_details;
        });
        return {"values":identified_broad_categories, "remaining_message":identified_words['remaining_message']};
    };
    let getOccasionMapEntities = (message) =>{
        let occasions_map_values = Object.keys(OccasionToProductlineMap);
        let synonym_map = {};
        occasions_map_values.forEach(function (occasion) {
            let occasion_data = JSON.parse(JSON.stringify(OccasionToProductlineMap[occasion]));
            try {
                occasion_data['synonyms'].forEach(function (synonym) {
                    synonym_map[synonym] = occasion;
                });
            }catch(e){}
        });
        let identified_words = wordIndentifier(Object.keys(synonym_map), message);
        let oc_to_pl_map_values = identified_words['values'].map(function (occasion_synonym) {
            let occasion = synonym_map[occasion_synonym];
            let map_obj = JSON.parse(JSON.stringify(OccasionToProductlineMap[occasion]));
            map_obj["key"] = occasion;
            delete map_obj['synonyms'];
            return map_obj;
        });
        return {"values":oc_to_pl_map_values, "remaining_message":identified_words['remaining_message']};
    };
    let getBodyProfileMapEntities = (message) =>{
        let body_profile_map_values = Object.keys(BodyProfileMapping);
        let synonym_map = {};
        body_profile_map_values.forEach(function (profile_value) {
            let profile_data = JSON.parse(JSON.stringify(BodyProfileMapping[profile_value]));
            // console.log(profile_data['synonyms']);
            profile_data['synonyms'].forEach(function (synonym) {
                synonym_map[synonym] = profile_value;
            });
        });
        let identified_words = wordIndentifier(Object.keys(synonym_map), message);
        let bp_to_pl_map_values = identified_words['values'].map(function (profile_synonym) {
            let profile_value = synonym_map[profile_synonym];
            let map_obj = JSON.parse(JSON.stringify(BodyProfileMapping[profile_value]));
            map_obj["key"] = profile_value;
            delete map_obj['synonyms'];
            return map_obj;
        });
        return {"values":bp_to_pl_map_values, "remaining_message":identified_words['remaining_message']};
    };
    let getTrendEntities = (message) => {
        let trendWords = MAPPING.trendWords.concat();
        let trend_identifiers = wordIndentifier(trendWords, message);
        let identified_value = "";
        if(trend_identifiers['values'].length>0){
            identified_value  = "trends";
            message = trend_identifiers['remaining_message'];
        };
        return { "value": identified_value, "remaining_message": message };
    };
    let getUserSupportedEntities = (message)=>{
        let undoWords = MAPPING.undoWords.concat();
        let resetWords = MAPPING.resetWords.concat();
        let helpWords = MAPPING.helpWords.concat();
        let greetWords = MAPPING.greetWords.concat();


        let identified_value = "";
        let help_identifiers = wordIndentifier(helpWords, message);
        if(help_identifiers['values'].length>0){
            identified_value  = "help";
            message = help_identifiers['remaining_message'];
        }
        let greet_identifiers = wordIndentifier(greetWords, message);
        if(greet_identifiers['values'].length>0){
            identified_value  = "greet";
            message = greet_identifiers['remaining_message'];
        }
        let undo_identfiers = wordIndentifier(undoWords, message);
        if(undo_identfiers['values'].length>0){
            identified_value  = "undo";
            message = undo_identfiers['remaining_message'];
        }
        let reset_identifiers = wordIndentifier(resetWords, message);
        if(reset_identifiers['values'].length>0){
            identified_value  = "reset";
            message = reset_identifiers['remaining_message'];
        }
        return { "value": identified_value, "remaining_message": message };
    };

    let getPreviousQuestionNeededEntities = (message, previous_asked_question)=> {
        let previous_question_needed_entities = MAPPING.previousQuestionEntities;
        let values = [];
        if(previous_question_needed_entities.hasOwnProperty(previous_asked_question)) {
            let previous_needed_values = previous_question_needed_entities[previous_asked_question];
            let synonym_obj = {};
            Object.keys(previous_needed_values).forEach(function (word) {
                previous_needed_values[word].forEach(function (synonym) {
                    synonym_obj[synonym] = word;
                });
            });
            let identified_words = wordIndentifier(Object.keys(synonym_obj), message);
            identified_words['values'].forEach(function (syn_word) {
                let word = synonym_obj[syn_word];
                if(values.indexOf(word)==-1) values.push(word);
            });
            message = identified_words['remaining_message'];
        }
        return { "values": values, "remaining_message":message };
    }
    let getAdjectiveModuleNeededEntitied = (message, product_line, previous_asked_question, question_name)=>{
        let values = [];
        if(previous_asked_question=='adjectiveModuleQuestion' && product_line && question_name && question_name!=''){
            product_line = MAPPING['productLineToDbMap'][product_line];
            let required_question = JSON.parse(JSON.stringify(AdjectiveQuestionFlow[product_line][question_name]));
            let synonym_obj = {};
            Object.keys(required_question['options']).forEach(function (option) {
                required_question['options'][option]['synonyms'].forEach(function (synonym) {
                    synonym_obj[synonym] = option;
                });
            });
            let identified_words = wordIndentifier(Object.keys(synonym_obj), message);
            if(identified_words['values'].length>0){
                message = identified_words['remaining_message'];
                values = identified_words['values'].map(function (synonym) {
                    return synonym_obj[synonym];
                });
            }
        }
        return {"values":values, "remaining_message":message};
    };
    let getDealEntities = (message)=> {
        let deal_words = MAPPING.dealWords.concat();
        let identified_words = wordIndentifier(deal_words, message);
        let deals_status = false;
        if(identified_words.values.length>0){
            message = identified_words['remaining_message'];
            deals_status = true;
        }
        return {"deal_status":deals_status, "remaining_message":message};
    };
    let entity_detection_functions = {
        getEntities : (message, user_context)=> {
            let entities = {};
            message = message.toLowerCase();
            let adjective_module_needed_details = getAdjectiveModuleNeededEntitied(message, user_context['product_line'], user_context["unanswered_question"], user_context['adjective_module_details']['question_name']);
            if (adjective_module_needed_details['values'].length > 0) {
                entities['adjective_module_needed_entities'] = adjective_module_needed_details['values'];
                message = adjective_module_needed_details['remaining_message'];
            }

            let previous_question_needed_details = getPreviousQuestionNeededEntities(message, user_context['unanswered_question']);
            if(previous_question_needed_details['values'].length>0) {
                message = previous_question_needed_details['remaining_message'];
                entities['previous_question_needed_entities'] = previous_question_needed_details['values'];
            }
            let cleaned_message = cleanSentence(message);

            let product_line_info = getProductLine(cleaned_message, user_context['product_line']);
            console.log("ProductLine Details : ", product_line_info);

            let db_product_line = product_line_info['product_line'];
            if(product_line_info["value"]) {
                entities['product_line'] = product_line_info['value'];
                cleaned_message = product_line_info['remaining_message'];
            }
            if(product_line_info.hasOwnProperty('already_existed_product_line')) {
                entities['already_existed_product_line_status'] = true;
                cleaned_message = product_line_info['remaining_message'];
            }
            if(!user_context.hasOwnProperty("product_line") && user_context.hasOwnProperty("occasion_productline_map") && entities.hasOwnProperty('product_line'))
            {
                cleaned_message = user_context["occasion_productline_map"]["key"] + " " + cleaned_message;
            }
            if (db_product_line) {
                let productline_related_entities = getProductLineRelatedEntities(cleaned_message, db_product_line);
                entities = Object.assign(entities, productline_related_entities["entities"]);
                cleaned_message = productline_related_entities['remaining_message'];
            }
            else {
                if(entities.hasOwnProperty('product_line')){
                    delete entities['product_line'];
                    entities['non_category_type'] = 'only_indianwear';
                }
            }
            let deals_entities = getDealEntities(cleaned_message);
            if(deals_entities.deal_status){
                cleaned_message = deals_entities['remaining_message'];
                entities['deal_status'] = true;
            }

            let broad_category_entities = getBroadCategoryEntities(cleaned_message);
            if(broad_category_entities['values'].length>0)
            {
                cleaned_message = broad_category_entities['remaining_message'];
                entities['broad_category'] = broad_category_entities['values'][0];
            }

            let occasion_mapping_entities = getOccasionMapEntities(cleaned_message);
            if(occasion_mapping_entities['values'].length>0) {
                cleaned_message = occasion_mapping_entities['remaining_message'];
                entities['occasion_productline_map'] = occasion_mapping_entities['values'][0];
                entities['occasion_productline_map']['is_checked'] = false;
            }
            let body_profile_mapping_entities = getBodyProfileMapEntities(cleaned_message);
            if(body_profile_mapping_entities['values'].length>0) {
                cleaned_message = body_profile_mapping_entities['remaining_message'];
                entities['body_profile_product_line_map'] = body_profile_mapping_entities['values'][0];
            }

            let range_words_details = getRangeWords(cleaned_message);
            if(range_words_details["entities"].hasOwnProperty('range') || range_words_details["entities"].hasOwnProperty('number')) {
                entities = Object.assign(entities, range_words_details['entities']);
                cleaned_message = range_words_details['remaining_message'];
            }
            let get_trends = getTrendEntities(cleaned_message);
            if(get_trends['value']!=""){
                entities['trends'] = get_trends['value'];
                cleaned_message = get_trends['remaining_message'];
            }

            let user_support_entities = getUserSupportedEntities(cleaned_message);
            if(Object.keys(user_support_entities['value']).length>0){
                if(Object.keys(entities).length==0)
                    entities['non_category_type'] = user_support_entities['value'];
                cleaned_message = user_support_entities['remaining_message'];
            }
            console.log("Bot Understood status ",user_context['unanswered_question'])
            if(!entities.hasOwnProperty('non_category_type') && ((entities.hasOwnProperty('product_line') && !user_context.hasOwnProperty('occasion_productline_map') && !user_context.hasOwnProperty('broad_category')) || user_context['unanswered_question']=='suggestionsMessage')) {
                entities['bot_understood_status'] = true;
            }

            let negative_word_details = getNegativeWords(cleaned_message);
            if(negative_word_details['values'].length>0){
                cleaned_message = negative_word_details['remaining_message'];
                entities['negative_words'] = negative_word_details['values'];
            }
            return {
                "entities": entities,
                "remaining_message": cleaned_message.trim()
            };
        }
    };
    return entity_detection_functions;
})();