module.exports = (function(){

    let random = (low, high)=>{
        return Math.floor(Math.random() * (high - low) + low);
    };
    let textMessages = (sentence) => {
        let message =
            {
                type:"text",
                content : sentence
            };
        return message;
    };
    let makeQuickRepliesOptions = (values) => {
        let options = [];
        values = values.slice(0,11);
        options = values.map(function(val){
            if(!val.key) {
                return {
                    "title": val,
                    "value": val
                }
            } else {
                return {
                    "title": val.value,
                    "value": val.key
                }
            }
        });
        return options;
    };
    let titleCase = (string) =>
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    let bot_questions = {
        textMessages : textMessages,
        introductionMessage: (name) =>
        {
            return textMessages("Hi "+name+". I am Selekt, your Fashion Shopping Assistant. I can assist you in buying women's western wear");
        },
        sendSuggestionsMessage : () =>
        {
            return textMessages("I can help you buy women tops. You can ask me queries like \n\n- Tops\n- Dresses under 999\n- Tops for women with tummy\n- Pastel color Tops\n- Need a Dress for a date");
        },
        greetMessage : () =>
        {
            return textMessages("Hello ");
        },
        otherInputMessage :() =>
        {
            return textMessages("Sorry, I can only process with text messages");
        },
        afterSuggestionsMessage : () =>
        {
            return textMessages("What do you want to shop today?");
        },
        thankMessage : (user_name) =>
        {
            return textMessages("Thanks a lot for providing these details "+user_name);
        },
        welcomeBackMessage : (name) => {
            return textMessages("Welcome back "+name+". Hope you are doing well.");
        },
        noIndianWearMessage: ()=> {
            return textMessages("Sorry, I can only help you buy Women Tops. We will include other categories soon.\n\nWhat do you want to shop in Women Tops?");
        },
        yesOrNoQuestion : (text) => {
            let messageData = {
                "type":'card',
                "content":{
                    "title":text,
                    "buttons":[
                        {
                            "type" : "postback",
                            "title": "YES",
                            "value":"yes"
                        },

                        {
                            "type" : "postback",
                            "title": "NO",
                            "value":"no"
                        }
                    ]
                }
            };
            return messageData;
        },
        occasionQuestion : (broad_occasion,sub_occasions) => {
            let is_there = false;
            for(i=0;i<sub_occasions.length;i++)
            {
                if(sub_occasions[i]=="Skip")
                    is_there = true;
            }
            if(!is_there)
                sub_occasions.push("Skip")
            // let nothing_option = {
            // 	key: "nothing",
            // 	value: "Nothing"
            // };
            // sub_occasions.push(nothing_option);
            let text = "Anything specific in "+broad_occasion+"?";
            return bot_questions.sendQuickRepliesMessage(text,sub_occasions);
        },
        okButtonQuestion : (text) => {
            let values = [{
                key :"ok",
                value : "OK"
            }]
            let messageData = bot_questions.sendButtonMessage(text,values)
            return messageData;
        },
        dealsMessage : (product_line) => {
            let sentence = "I am showing you the best deals in "+titleCase(product_line)+" considering the price history where the products' current price is equal to its lowest price till date and is also with high discounts";
            sentence = sentence+"\n\nTap on deal tag on product to know more.";
            return textMessages(sentence);
        },
        helpMessage : () => {
            let sentence = "You can type 'clear' or 'start again' to start a new session.\n\nKindly follow the options in each question to help me understand better."
            return textMessages(sentence);
        },
        inBetweenChatMessage : (require_message) =>
        {
            let sentence = "Ok, I am showing you the "+require_message+" in your present list";
            return textMessages(sentence);
        },
        askProductLineMessage : () =>
        {
            let sentence = "Which clothing line are you are you looking for? \n(Eg: Dresses, Tops etc)";
            return textMessages(sentence);
        },
        askResetQuestion : ()=>{
            let text = "Do you want reset your session?";
            let values = [
                {
                    key :"yes",
                    value : "Yes, Reset"
                },
                {
                    key : "no",
                    value : "No, Continue chat"
                }
            ];
            let messageData = bot_questions.sendButtonMessage(text,values)
            return messageData;
        },
        noEntitiesMessage: () =>
        {
            let sorry_messages = [
                "Sorry, I did not understand your message. Let's try again",
                "Oops, I did not get your message. Let's try again",
                "Sorry, I did not get that. Let's try again"
            ];
            let sentence = sorry_messages[random(0,sorry_messages.length-1)];
            return textMessages(sentence);
        },
        profileSummaryQuestion : (profile) => {
            let sentence = "Here is your profile summary\nAge: "+profile.ageInYears+"\nBody Shape: "+profile.bodyshape.key+"\nSkin Tone: "+profile.skintone.key+"\nHeight: "+profile.height.key+"\nBody Concerns: "+profile["body_concerns"].join(',');
            return textMessages(sentence);
        },
        occasionInfoMessage: (products_count,user_name) => {
            let sentence = "Alright! Help me with a few answers and I can recommend some great Styles.";
            return textMessages(sentence);
        },
        occasionProductlineQuestion: (occasion, product_lines) => {
            let values = product_lines.map(function(val) {
                return {
                    key: occasion+" "+val,
                    value: val
                };
            });
            let text = "Choose a clothing line for "+occasion

            return bot_questions.sendQuickRepliesMessage(text,values);
        },
        conversationCompleteMessage: (sessionId) => {
            let sentence = "We are done!\nPlease view my recommended products!";
            let message ={
                "type" : "card",
                "content" : {
                    "title":sentence,
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Check list",
                            "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title" : "Give Feedback",
                            "value" : "feedback"
                        }
                    ]
                }
            };
            return message;
        },
        makeAdjModuleQuestion : (response, product_line,sessionId) => {
            let options = response["options"];
            let elements_array=[];
            options.forEach(function(value){
                elements_array.push({
                    "title":value.value+' ('+value.product_count+')',
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Learn more",
                            "value":"https://www.selekt.in/chatbot-solution/women/adjective_reason?product_line="+product_line+"&&adjective_value="+value.value+"&&backend_key="+value.backend_key,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title": value.value,
                            "value":value.key
                        }
                    ]
                });
            });
            let select_multiple = {
                "title":"Select multiple",
                //"image_url":"https://www.whitehouseblackmarket.com/Product_Images/570215271_001.jpg?output-quality=85",
                //"image_aspect_ratio":"square",
                "buttons":[
                    {
                        "type" : "web_url",
                        "title": "Select multiple",
                        "url":"https://www.selekt.in/chatbot-solution/women/refine_the_list?id="+sessionId+"&&type=adjective_module",
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true
                    }
                ]
            };
            elements_array.push(select_multiple);
            let messageData = {
                type: 'carousel',
                content: elements_array
            };
            return messageData;
        },
        productListReasonMessage: (user_name,user_profile) =>
        {
            let sentence = "";
            if(((!user_profile.hasOwnProperty("age") && !user_profile.hasOwnProperty("height") && !user_profile.hasOwnProperty("skintone") && !user_profile.hasOwnProperty("bodyshape")) && user_profile["body_concerns"].length==0)||(user_profile.skip_status))
            {
                sentence = "Thanks "+ titleCase(user_name) +"!";
            }
            else
            {
                sentence = "Thanks "+ titleCase(user_name) +"! I have picked suitable styles and sorted them based on your Body Profile.";
            }
            return textMessages(sentence);
        },
        displayProductCount : (count,sessionId)=> {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"I have got "+ count +" styles matching your request. Check your list.\nContinue Chat in case you want Style Recommendations",
                    "buttons":[
                        {
                            "type" : "postback",
                            "title": "Continue Chat",
                            "value":"continue_chat"
                        },
                        {
                            "type" : "web_url",
                            "title": "Check list",
                            "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "web_url",
                            "title": "Add more Filters",
                            "value":" https://www.selekt.in/chatbot-solution/women/add_filters?session_id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        }
                    ]
                }
            };
            return messageData;
        },
        profileInfoMessage: () =>
        {
            let sentence = "I can further sort the list based on your Body Profile.";
            return textMessages(sentence);
        },
        profileConfirmationQuestion : () =>
        {
            let messageData =
            {
                "type":"card",
                "content":{
                    "text":"Is this you?",
                    "buttons":[
                        {
                            "type" : "postback",
                            "title": "It's me",
                            "value":"its_me"
                        },

                        {
                            "type" : "postback",
                            "title": "Not me",
                            "value":"not_me"
                        },
                        {
                            "type" : "postback",
                            "title": "Skip",
                            "value":"skip"
                        }
                    ]
                }
            };
            return messageData;
        },
        sendButtonMessage : (text, values) =>
        {
            let messageData = {
                type: 'card',
                content: {
                    title: text,
                    buttons: bot_questions.makeButtonOptions(values)
                }
            };
            return messageData;
        },
        noProductFoundMessage: () =>
        {
            let sentence = "Sorry! I have not found any products as per your request.";
            return textMessages(sentence);
        },
        lessProducts: (sessionId, products_count) =>
        {
            let less_products_message = "Sorry, I can not assist you further as there are only "+products_count+" products as per your need";
            let message ={
                "type":"card",
                "content":{
                    "title":less_products_message,
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Check list",
                            "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "web_url",
                            "title": "Check Latest Trends",
                            "value":" https://www.selekt.in/chatbot-solution/women/trends?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title" : "Give Feedback",
                            "value" : "feedback"
                        }
                    ]
                }
            };
            return message;
        },
        occasionFilterConflictQuestionButton : (filters, occasion, product_line )=> {
            let	text= "Do you want to see product for?"
            let options = [filters + " " +product_line,occasion + " " +product_line]
            return bot_questions.sendButtonMessage(text,options);
        },
        occasionFilterConflictQuestionText : (filters, occasion, product_line) =>
        {
            let sentence = "I am sorry, I usually don't recommend "+filters+" "+product_line+" for "+occasion+".";
            return textMessages(sentence);
        },
        checkTrendsQuestion : (sessionId) => {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"I have picked the latest trends for you. Check those. In case you want to reset the chat. type 'clear'",
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Check Trends",
                            "value":" https://www.selekt.in/chatbot-solution/women/trends?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title" : "Give Feedback",
                            "value" : "feedback"
                        }
                    ]
                }
            };
            return messageData;
        },
        askFiltersQuestion: (sessionId) => {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"Do you want to filter certain styles?",
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Yes! Add Filters",
                            "value":"https://www.selekt.in/chatbot-solution/women/add_filters?session_id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },

                        {
                            "type" : "postback",
                            "title": "Style Me",
                            "value":"no"
                        },
                        {
                            "type" : "web_url",
                            "title": "Check the list first",
                            "value":"https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        }
                    ]
                }
            };
            return messageData;
        },
        filterOccasionConflictQuestion : (filters, occasion, product_line) => {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"How would you like to proceed?",
                    "buttons":[
                        {
                            "type" : "postback",
                            "title": "Show Recommendations",
                            "value":"suggest_recommended"
                        },

                        {
                            "type" : "postback",
                            "title": "Go as per my likes",
                            "value":"go_as_per_my_likes"
                        }
                    ]
                }
            };
            return messageData;
        },
        makeButtonOptions : (values,type,sessionId) => {
            let options = [];
            let if_type = {
                "type" : "web_url",
                "title": "select multiple",
                "value":"https://www.selekt.in/chatbot-solution/women/refine_the_list?id="+sessionId+"&&type=adjective_module",
                "webview_height_ratio": "tall",
                "messenger_extensions": true
            };
            for (x in values)
            {
                var option ;
                if(values[x])
                {
                    if(!values[x].key)
                    {
                        option = {
                            "type" : "postback",
                            "title": values[x],
                            "value": values[x]
                        }
                    }
                    else
                    {
                        option = {
                            "type" : "postback",
                            "title": values[x].value,
                            "value": values[x].key
                        }
                    }
                }
                if(option!=undefined)
                {
                    options.push(option)
                }
            }
            if(type=="multi_select")
            {
                options.push(if_type);
            }
            return options;
        },
        feedBackQuestion : () =>
        {
            let text = "How was your experience?";
            let values =
            [
                {
                    "key" : "loved_it",
                    "value" : "Loved it"
                },
                {
                    "key" : "bad",
                    "value" : "Bad"
                },
                {
                    "key" : "other",
                    "value" : "Other"
                },
            ]
            let messageData = bot_questions.sendButtonMessage(text,values);
            return messageData;
        },
        sendQuickRepliesMessage : (text,values) =>
        {
            let messageData = {
                type: 'quickReplies',
                content: {
                    title: text,
                    buttons: makeQuickRepliesOptions(values)
                }
            };
            return messageData;
        },
        askBodyConcernsQuestion : (text,sessionId) =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements": [
                        {
                            "title":text,
                            "buttons":[
                                {
                                    "type" : "web_url",
                                    "title": "Give Body Concerns",
                                    "value":"https://www.selekt.in/chatbot-solution/women/bodyconcern?id="+sessionId,
                                    "webview_height_ratio": "tall",
                                    "messenger_extensions": true
                                },
                                {
                                    "type":"postback",
                                    "title":"No",
                                    "value":"skip"
                                }
                            ]
                        }
                    ]
                }
            };
            return messageData;
        },
        proceedFurtherQuestion : (sessionId, deals_status) => {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"If you further want to refine your list, click on 'Continue Chat'.",
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Check list",
                            "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title": "Continue Chat",
                            "value" : "add_preferences"
                        }
                    ]
                }
            };
            return messageData;
        },
        continueStatusQuestion :  (sessionId) => {
            let messageData =
            {
                "type":"card",
                "content": {
                    "title":"How do you want to proceed further?",
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Check list",
                            "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        {
                            "type" : "postback",
                            "title": "Continue Chat",
                            "value":"continue_chat"
                        }
                    ]
                }
            };
            return messageData;
        },
        customizeQuestion : (response,sessionId) => {
            var tile_length = Object.keys(response.options).length;
            var options = response.options.map(function(option){
                return {
                    "title" : option.value,
                    "buttons" : [
                        {
                            "type" : "postback",
                            "title": option.value,
                            "value":option.key
                        }]
                }
            });
            options.push({
                "title" : "select multiple",
                "buttons" : [
                    {
                        "type" : "web_url",
                        "title": "select multiple",
                        "value":"https://www.selekt.in/chatbot-solution/women/refine_the_list?id="+sessionId+"&&type=adjective_module",
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true
                    }
                ]
            });
            let messageData = {
                "type" : "carousel",
                "content" : options
            };
            return messageData;
        },
        bodyProfileShapeMessage : () =>
        {
            let sentence = "What Body Shape describes you best?";
            return textMessages(sentence);
        },
        someIdentifiedQuestion: () => {
            let messageData = {
                "type":"card",
                "content":{
                    "title":"Have I understood it right?",
                    "buttons":
                        [
                            {
                                "type" : "postback",
                                "title": "Yes",
                                "value": "yes"
                            },
                            {
                                "type" : "postback",
                                "title": "No",
                                "value": "no"
                            }
                        ]
                }
            };
            return messageData;
        },
        bodyProfileShapeQuestion : () =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements":[
                        {
                            "title":"What is Hourglass Shape?",
                            //"image_url": "https://www.selekt.in/chatbot-solution/women/client/hourglass_cut.png",
                            "subtitle": "The bust and hips are basically the same size and your waist is well defined",
                            //"image_aspect_ratio":"square",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Hour glass",
                                    "value":"hourglass"
                                }
                            ]
                        },
                        {
                            "title":"What is Apple Shape?",
                            //"image_url": "https://www.selekt.in/chatbot-solution/women/client/apple_cut.jpg",
                            "subtitle": "Waist is larger than bust and hips. The hips are narrow compared to shoulders",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Apple",
                                    "value":"apple"
                                }
                            ]
                        },
                        {
                            "title":"What is a Rectangle Shape?",
                            //"image_url": "https://www.selekt.in/chatbot-solution/women/client/rectangle_cut.png",
                            "subtitle": "Bust and hips are basically the same size. Waist is only slightly slimmer",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Rectangle",
                                    "value":"rectangle"
                                }
                            ]
                        },
                        {
                            "title":"What is Pear Shape?",
                            //"image_url": "https://www.selekt.in/chatbot-solution/women/client/pear_body_cut.png",
                            "subtitle": "Hips are larger than busts, and the waist gradually slopes out to the hips",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Pear",
                                    "value":"pear"
                                }
                            ]
                        },
                        {
                            "title":"Skip",
                            //"image_url": "https://www.selekt.in/chatbot-solution/women/client/pear_body_cut.png",
                            //"subtitle": "The hips are larger than the bust, and the waist gradually slopes out to the hips",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Skip",
                                    "value":"skip"
                                }
                            ]
                        }
                    ]
                }
            };
            return messageData;
        },
        bodyProfileSkinToneQuestion :() =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements":[
                        {
                            "title":"Fair",
                            "image_url": "https://www.selekt.in/chatbot-solution/women/client/fair.jpg",
                            //"subtitle": "that are curvy looking to give a curvy appearance to your body shape",
                            //"image_aspect_ratio":"square",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Fair",
                                    "value":"fair"
                                }
                            ]
                        },
                        {
                            "title":"Wheatish",
                            "image_url": "https://www.selekt.in/chatbot-solution/women/client/wheatish.jpg",
                            //"subtitle": "with detailing and bright colors that will take away the attention from mid section",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Wheatish",
                                    "value":"wheatish"
                                }
                            ]
                        },
                        {
                            "title":"Dusky",
                            "image_url": "https://www.selekt.in/chatbot-solution/women/client/dusky.jpg",
                            //"subtitle": "that are curvy looking to give a curvy appearance to your body shape",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Dusky",
                                    "value":"dark"
                                }
                            ]
                        },
                        {
                            "title":"Skip",
                            "image_url": "http://3nw94z2pgadc432nw33p8qg5.wpengine.netdna-cdn.com/wp-content/uploads/2012/11/wrap-dress.jpg",
                            //"subtitle": "that will lengthen the leg line, giving a vertical appearance. thus highlighting the curves better",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Skip",
                                    "value":"skip"
                                }
                            ]
                        }
                    ]
                }
            };
            return messageData;
        },
        broadOccasionQuestion : (product_line, broad_occasions) =>
        {
            let text = "What occasion are you buying this for?";
            return bot_questions.sendQuickRepliesMessage(text,broad_occasions);
        },
        brandDealsStatusQuestion : (sessionId,deals_text,deals_option) =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements":
                    [
                        {
                            "title":deals_text,
                            "buttons":[
                                {
                                    "type" : "web_url",
                                    "title": "Check list",
                                    "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                                    "webview_height_ratio": "tall",
                                    "messenger_extensions": true
                                },
                                {
                                    "type" : "postback",
                                    "title": deals_option,
                                    "value":deals_option
                                }
                            ]
                        }
                    ]
                }
            };
            return messageData;
        },
        occasionProductlineQuestion: (occasion, product_lines) =>
        {
            let values = product_lines.map(function(val)
            {
                return {
                    key: val,
                    value: val
                };
            });
            let text = "Choose a clothing line for "+occasion
            return bot_questions.sendQuickRepliesMessage(text,values);
        },
        brandDealsQuestion : (sessionId) =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements":[
                        {
                            "title":"Premium brands",
                            "subtitle": "eg: And, Vero moda, Mango etc",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Premium brands",
                                    "value":"premium brands"
                                }
                            ]
                        },
                        {
                            "title": "High end brands",
                            "subtitle": "eg: Biba, Forever 21, 109f etc.",
                            "buttons": [
                                {
                                    "type" : "postback",
                                    "title": "High end brands",
                                    "value":"high end brands"
                                }
                            ]
                        },
                        {
                            "title":"All brands",
                            "subtitle": "Will consider all brands",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "Any brand",
                                    "value":"all brands"
                                }
                            ]
                        },
                        {
                            "title":"Select multiple",
                            "subtitle": "Will consider your selections",
                            "buttons":[
                                {
                                    "type" : "web_url",
                                    "title": "Select multiple",
                                    "value":" https://www.selekt.in/chatbot-solution/women/refine_the_list?id="+sessionId+"&&type=deals",
                                    "webview_height_ratio": "tall",
                                    "messenger_extensions": true
                                }
                            ]
                        }
                    ]
                }
            };
            return messageData;
        },
        brandDealsReasonMessage : (selected_values, product_line) =>
        {
            let sentence = "Ok, I have filtered "+selected_values.join(", ")+" from today's best deals in Myntra, Jabong, Voonik "+product_line;
            return textMessages(sentence);
        },
        occasionConflictQuestionText : (product_line, occasion)=>
        {
            let sentence = "I am sorry, I usually don't recommend "+product_line+" for "+occasion+".";
            return textMessages(sentence);
        },
        occasionConflictQuestionButton : (product_line,occasion)=>
        {
            let text = "Do you want to see product for?";
            let options = [product_line,occasion]
            return bot_questions.sendButtonMessage(text,options);
        },
        changeProductLineQuestion : ()=>{
            let text = "do you want change your category?";
            let options = ["yes","no"]
            return bot_questions.sendButtonMessage(text,options);
        },
        bodyProfileAgeQuestion : (user_name) =>
        {
            let sentence =  "How old are you "+user_name+"? (Give me a number in years)";
            return textMessages(sentence);
        },
        bodyProfileHeightQuestion : () =>
        {
            let height_message = "What do you feel about your height?";
            let options = ["Short","Tall","Average","Skip"];

            return bot_questions.sendQuickRepliesMessage(height_message,options)
        },
        bodyProfileSkinTone : () =>
        {
            let values = ["Fair","Wheatish","Dusky","Skip"];
            let text ="What is your Skin Tone?";
            return bot_questions.sendQuickRepliesMessage(text,values);
        },
        bodyProfileSkinToneMessage : () =>
        {
            let sentence = "What is your Skin Tone?";
            return textMessages(sentence);
        },
        displayReasonMessage: (text,sessionId, occasion_status, profile_status,concern_status) =>
        {
            let messageData = {
                "type":"list",
                "content":{
                    "elements":
                        [
                            {
                                "title":text,
                                "buttons":[
                                    {
                                        "type" : "web_url",
                                        "title": "Check list",
                                        "value": "https://www.selekt.in/chatbot-solution/women/products_list?id="+sessionId,
                                        "webview_height_ratio": "tall",
                                        "messenger_extensions": true
                                    }
                                ]
                            }
                        ]
                }
            };
            if(!occasion_status || (occasion_status && !profile_status))
            {
                messageData.content.elements[0].buttons.unshift({
                    "type" : "postback",
                    "title": "Continue Chat",
                    "value":"continue_chat"
                });
            }
            return messageData;
        }
    };
    return bot_questions;
})();