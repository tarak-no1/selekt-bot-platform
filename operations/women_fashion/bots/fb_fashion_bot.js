const SESSIONS = require('../../sessions.js');
const BOT_QUESTIONS = require('../supporters/bot_questions.js');
const ENTITY_BOT = require('./entity-bot');
const BOT_SUPPORT = require('./bot_support');
const HELPER = require('../../helper');
const CHAT_FLOW_SUPPORTER = require('./chat_flow_supporter');
const UNDO_STATE = require('../supporters/undo_state');

module.exports = (function () {
    /*
    * this function is used to extract user given message
    */
    let extractUserMessage = (messaging)=>
    {
        let attachment = messaging['attachment'];
        let user_message;
        if(attachment.type=='text' || attachment.type=='payload') {
            // Yay! We got a new text message!
            //taking reply as user message
            user_message = attachment.content;
            console.log("Got Payload message "+ user_message);
        }
        else if(messaging.message) {
            // Yay! We got a new message!
            //taking message as user message
            user_message = messaging.message.text;
            if (messaging.message.hasOwnProperty("quick_reply")) {
                user_message = messaging.message.quick_reply.payload;
            }
            console.log("Got typed message :", user_message);
        }
        return user_message;
    };
    /*
    / this function is used to send welcome message to user
    */
    let welcomeMessage = (session_id) => {
        CHAT_FLOW_SUPPORTER.checkInstructionMessage(session_id);
        CHAT_FLOW_SUPPORTER.checkAboutMe(session_id);
        let user_context = SESSIONS.getContext(session_id);
        if(user_context['welcome_message_status']) {
            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "welcome_message_status");
            user_context['welcome_message_status'] = false;
            user_context['bot_messages'] = [];
            let username = user_context['username'];
            let intro_message = BOT_QUESTIONS.introductionMessage(username);
            user_context["bot_messages"].push(intro_message);

            let about_me_question = BOT_QUESTIONS.okButtonQuestion("Before we begin, there are a few things you need to know about me. Ok?");
            user_context["bot_messages"].push(about_me_question);

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "unanswered_question");
            user_context['unanswered_question'] = "aboutMe";

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;

        }
        SESSIONS.storeContext(session_id, user_context);
    };
    /*
    / this function is used to send welcomeback messages to user
    */
    let welcomeBackMessage = (session_id)=>{
        let user_context =  SESSIONS.getContext(session_id);
        if(user_context["welcome_back_message_status"]) {
            console.log("In Welcome Back Message function");

            user_context = UNDO_STATE.storePreviousStateDetails(user_context, "welcome_back_message_status");
            user_context['welcome_back_message_status'] = false;
            let username = user_context['username'];
            let welcomeback_message = BOT_QUESTIONS.welcomeBackMessage(username);
            user_context["bot_messages"].unshift(welcomeback_message);

            /*user_context = UNDO_STATE.storePreviousStateDetails(user_context, "question_state");
            user_context['question_state'] = false;*/
            SESSIONS.storeContext(session_id, user_context);
        }
    };
    let bot_functions = {
        processUserMessage : (session_id, messaging) =>{
            console.log("Inside processuser message");
            let user_context = SESSIONS.getContext(session_id);
            let user_message = extractUserMessage(messaging);
            user_context["sent_message"] = false;
            // getting entities for the message
            if(user_context["unanswered_question"]!="takeFeedback") {
                let entities_detection = ENTITY_BOT.getEntities(user_message, user_context);
                console.log("Detected Entities :\n",JSON.stringify(entities_detection, null, 2));
                let entities = entities_detection["entities"];//
                let remaining_message = entities_detection['remaining_message'];

                let entities_length = Object.keys(entities).length;

                user_context = UNDO_STATE.storePreviousStateDetails(user_context, "current_entities");
                user_context['current_entities'] = entities;
                user_context['user_message'] = user_message;
                SESSIONS.storeContext(session_id, user_context);
                if (entities_length == 0) {
                    let no_entities_message = BOT_QUESTIONS.textMessages("Oops, I did not get your message. Let's try again");
                    user_context['bot_messages'].push(no_entities_message);
                    SESSIONS.storeContext(session_id, user_context);
                } else {
                    BOT_SUPPORT.addEntitiesToContext(session_id, user_message, entities, remaining_message);
                }
            }
           
            bot_functions.flowChat(session_id);
        },
        flowChat:(session_id) => {
            let user_context = SESSIONS.getContext(session_id);
            let entities = user_context['current_entities']?user_context['current_entities']:{};
            // console.log(JSON.stringify(user_context, null, 2));
            CHAT_FLOW_SUPPORTER.checkPreviousAskedQuestion(session_id);
            let continue_status = user_context.hasOwnProperty('non_category_type')? CHAT_FLOW_SUPPORTER.nonCategoryFunctions[user_context['non_category_type']](session_id):true;
            user_context = SESSIONS.getContext(session_id);
            console.log("Previous asked Question: ", user_context['unanswered question'])
            welcomeMessage(session_id);
            welcomeBackMessage(session_id);
            if(continue_status) {
                continue_status = CHAT_FLOW_SUPPORTER.checkBotUnderstoodModule(session_id, entities);
                if(continue_status) {
                    user_context = SESSIONS.getContext(session_id);
                    HELPER.getProductCount(user_context, (product_count) => {
                        console.log("Total Products : ", product_count);
                        CHAT_FLOW_SUPPORTER.checkForChangedProductLine(session_id);
                        CHAT_FLOW_SUPPORTER.checkForProductLine(session_id);
                        CHAT_FLOW_SUPPORTER.checkForConflict(session_id);
                        CHAT_FLOW_SUPPORTER.checkForReasonMessages(session_id, product_count);
                        continue_status = CHAT_FLOW_SUPPORTER.checkForLessProducts(session_id, product_count);
                        console.log("Continue Status : ", continue_status);
                        if (continue_status) {
                            CHAT_FLOW_SUPPORTER.checkForFiltersStatus(session_id);
                            CHAT_FLOW_SUPPORTER.checkForOccasion(session_id);
                            CHAT_FLOW_SUPPORTER.checkForBodyProfile(session_id);
                            CHAT_FLOW_SUPPORTER.checkForProcessFurtherStatus(session_id);
                            CHAT_FLOW_SUPPORTER.checkForAdjectiveModuleStatus(session_id, function () {
                                HELPER.sendBotMessages(session_id);
                            });
                        }
                    });
                }
            }
            if(!continue_status){
                HELPER.sendBotMessages(session_id);
            }
        }
    };
    return bot_functions;
})();