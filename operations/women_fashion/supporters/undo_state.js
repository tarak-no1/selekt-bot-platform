const SESSIONS = require('../../sessions');
const BOT_QUESTIONS = require('../supporters/bot_questions')
module.exports = (function () {
    let isObject = (val)=>{
        return (typeof val === 'object');
    };

    let updatePreviousState = (session_id, previous_state)=>{
        let user_context = SESSIONS.getContext(session_id);
        // console.log("\nPrevious Added Values : ");
        // console.log("=================================");
        Object.keys(previous_state).forEach(function (context_key) {
            // console.log(context_key, JSON.stringify(previous_state[context_key], null, 2));
            if(previous_state[context_key]==undefined){
                delete user_context[context_key];
            }
            else{
                user_context[context_key] = previous_state[context_key];
            }
        });
        SESSIONS.storeContext(session_id, user_context);
    };
    let sendPreviousMessages = (session_id)=>{
        let user_context = SESSIONS.getContext(session_id);
        let length_of_actions = user_context['previous_user_actions'].length;

        if(length_of_actions>0) {
            let bot_messages = user_context['previous_user_actions'][length_of_actions-1]['messages'];
            if(bot_messages.length>0) {
                user_context['recast_message'].addReply(bot_messages);
                user_context['recast_message'].reply().then(p => console.log("message sent"));
            }
        }
        else {
            let bot_messages = user_context['bot_messages'];
            if(bot_messages.length>0){
                user_context['recast_message'].addReply(bot_messages);
                user_context['recast_message'].reply().then(p => console.log("message sent"))
            }
        }
    };
    // let savePreviousStateDetails = (session_id, context_key)=>{
    //     let user_context = SESSIONS.getContext(session_id);
    //     if(!user_context['context_changes'].hasOwnProperty('previous_state')) {
    //         user_context['context_changes'] = {
    //             "previous_state": {},
    //             "messages":[]
    //         };
    //     }
    //     if(!user_context['context_changes']['previous_state'].hasOwnProperty(context_key)){
    //         user_context['context_changes']['previous_state'][context_key] = user_context[context_key];
    //         SESSIONS.storeContext(session_id, user_context);
    //     }
    // };
    let storePreviousStateDetails = (user_context, context_key)=>{
        if(!user_context['context_changes']["previous_state"].hasOwnProperty(context_key)){
            let user_context_value = user_context[context_key];
            if(Array.isArray(user_context_value)){
                user_context['context_changes']['previous_state'][context_key] = user_context_value.concat();
            }
            else if(typeof user_context_value === 'object'){
                user_context['context_changes']['previous_state'][context_key] = JSON.parse(JSON.stringify(user_context_value));
            }
            else {
                user_context['context_changes']['previous_state'][context_key] = user_context_value;
            }
        }
        return user_context;
    };
    let undo_functions = {
        getUndoState : (session_id)=> {
            let user_context = SESSIONS.getContext(session_id);
            let all_user_actions = user_context['previous_user_actions'].concat();
            if(all_user_actions.length>0) {
                let previous_user_action = user_context['previous_user_actions'].pop();
                // console.log(JSON.stringify(previous_user_action,null,2));
                SESSIONS.storeContext(session_id, user_context);
                updatePreviousState(session_id, previous_user_action['previous_state']);
                sendPreviousMessages(session_id);
            } else {
                user_context['previous_user_actions'].push(all_user_actions[0]);
                SESSIONS.storeContext(session_id, user_context);
                sendPreviousMessages(session_id);
            }
        },
        storePreviousStateDetails: storePreviousStateDetails,
        updatePreviousState : updatePreviousState,
        sendPreviousMessages : sendPreviousMessages
    };
    return undo_functions;
})();