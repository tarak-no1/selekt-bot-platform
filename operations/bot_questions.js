module.exports = (function(){
    let random = (low, high)=>{
        return Math.floor(Math.random() * (high - low) + low);
    };
    let makeQuickRepliesOptions = (values) => {
        let options = [];
        values = values.slice(0,11);
        options = values.map(function(val){
            if(!val.key) {
                return {
                    "content_type" : "text",
                    "title": val,
                    "payload": val
                }
            } else {
                return {
                    "content_type" : "text",
                    "title": val.value,
                    "payload": val.key
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
        textMessages : (txt) =>
        {
            let message =
                {
                    text: txt
                };
            return message;
        },
        introductionMessage: (name) =>
        {
            let message = {
                "text":"Hi "+name+". I am Selekt, your Fashion Shopping Assistant. I can assist you in buying women's western wear"
            }
            return message;
        },
        sendSuggestionsMessage : () =>
        {
            // let message = {
            // 	text : "You can ask me queries like \n\n- Tops\n- Best deals in dresses\n- Jeans under 999\n- Dresses for women with tummy\n- Pastel color tshirts\n- Need a skirt for a date"
            //          };
            // let message = {
            // 	text : "I can help you buy women tops. You can ask me queries like \n\n- Tops\n- Best deals in Tops\n- Tops under 999\n- Tops for women with tummy\n- Pastel color Tops\n- Need a Top for a date"
            //       };
            let message = {
                text : "I can help you buy women tops. You can ask me queries like \n\n- Tops\n- Dresses under 999\n- Tops for women with tummy\n- Pastel color Tops\n- Need a Dress for a date"
            };

            return message;
        },
        greetMessage : () =>
        {
            let greet_message = {
                "text":"Hello "
            };
            return greet_message;
        },
        otherInputMessage :() =>
        {
            let message = {
                text : "Sorry, I can only process with text messages"
            };

            return message;
        },
        afterSuggestionsMessage : () =>
        {
            let message = {
                text : "What do you want to shop today?"
            }
            return message;
        },
        thankMessage : (user_name) =>
        {
            let message ={
                text : "Thanks a lot for providing these details "+user_name
            }
        },
        welcomeBackMessage : (name) =>
        {
            let message = {
                "text":"Welcome back "+name+". Hope you are doing well."
            }
            return message;
        },
        noIndianWearMessage: ()=>
        {
            // let message = {
            // 	text: "Sorry, we only assist for women western wear at present. We will include indian wear soon.\n\nWhat do you want to shop in women western wear?"
            // };
            let message = {
                text: "Sorry, I can only help you buy Women Tops. We will include other categories soon.\n\nWhat do you want to shop in Women Tops?"
            };
            return message;
        },
        yesOrNoQuestion : (text) =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":text,
                        "buttons":[
                            {
                                "type" : "postback",
                                "title": "YES",
                                "payload":"yes"
                            },

                            {
                                "type" : "postback",
                                "title": "NO",
                                "payload":"no"
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        occasionQuestion : (broad_occasion,sub_occasions) =>
        {
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
            let message = {
                text : sentence
            }
            return message;
        },
        helpMessage : () =>
        {
            let sentence = "You can type 'clear' or 'start again' to start a new session.\n\nKindly follow the options in each question to help me understand better."
            let message = {
                text : sentence
            }
            return message;
        },
        inBetweenChatMessage : (require_message) =>
        {
            let sentence = "Ok, I am showing you the "+require_message+" in your present list";
            let message = {
                text : sentence
            }
            return message;
        },
        askProductLineMessage : () =>
        {
            let sentence = "Which clothing line are you are you looking for? \n(Eg: Dresses, Tops etc)";
            let message ={
                text : sentence
            }
            return message;
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
            let message ={
                text : sentence
            }
            return message;
        },
        profileSummaryQuestion : (profile) =>
        {
            let message = {
                "text": "Here is your profile summary\nAge: "+profile.ageInYears+"\nBody Shape: "+profile.bodyshape.key+"\nSkin Tone: "+profile.skintone.key+"\nHeight: "+profile.height.key+"\nBody Concerns: "+profile["body_concerns"].join(',')
            }
            return message;
        },
        occasionInfoMessage: (products_count,user_name) =>
        {
            let sentence = "Alright! Help me with a few answers and I can recommend some great Styles.";
            let message ={
                text : sentence
            }
            return message;
        },
        occasionProductlineQuestion: (occasion, product_lines) =>
        {
            let values = product_lines.map(function(val)
            {
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
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":sentence,
                        "buttons":[
                            {
                                "type" : "web_url",
                                "title": "Check list",
                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "postback",
                                "title" : "Give Feedback",
                                "payload" : "feedback"
                            }
                        ]
                    }
                }
            }
            return message;
        },
        makeAdjModuleQuestion : (response,product_line,sessionId) =>
        {
            let options = response["options"];
            let elements_array=[];
            options.forEach(function(value){
                elements_array.push({
                    "title":value.value+' ('+value.product_count+')',
                    //"image_url":value.image_url,
                    //"image_aspect_ratio":"square",
                    "buttons":[
                        {
                            "type" : "web_url",
                            "title": "Learn more",
                            "url":"https://www.prodx.in/fashion-bot/adjective_reason?product_line="+product_line+"&&adjective_value="+value.value+"&&backend_key="+value.backend_key,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true,
                        },
                        {
                            "type" : "postback",
                            "title": value.value,
                            "payload":value.key
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
                        "url":"https://www.prodx.in/fashion-bot/refine_the_list?id="+sessionId+"&&type=adjective_module",
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true
                    }
                ]
            }
            elements_array.push(select_multiple);
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "image_aspect_ratio":"square",
                        "elements":elements_array
                    }
                }
            }
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
            // if(((!user_profile.hasOwnProperty("age") && !user_profile.hasOwnProperty("height") && !user_profile.hasOwnProperty("skintone") && !user_profile.hasOwnProperty("bodyshape")) && user_profile["body_concerns"].length==0)||(user_profile.skip_status))
            // {
            // 	sentence = "Thanks for providing these details "+user_name+". Your list is sorted based on given needs. You can check your list\n or \nNow that I know about you, I can help you in selecting filters to further narrow down.";
            // }
            // else if((user_profile.hasOwnProperty("age") || user_profile.hasOwnProperty("height") || user_profile.hasOwnProperty("bodyshape") || user_profile.hasOwnProperty("skintone")) && user_profile["body_concerns"].length==0)
            // {
            // 	sentence = "Thanks for providing these details "+user_name+". Your list is sorted based on body profile and other needs given. You can check your list\n or \nNow that I know about you, I can help you in selecting filters to further narrow down.";
            // }
            // else if(((!user_profile.hasOwnProperty("age") && !user_profile.hasOwnProperty("height") && !user_profile.hasOwnProperty("skintone") && !user_profile.hasOwnProperty("bodyshape")) && user_profile["body_concerns"].length>0)||(user_profile.skip_status&&user_profile["body_concerns"].length>0))
            //   	{
            //   		sentence = "Thanks for providing these details  "+user_name+". Your list is sorted based on body concerns and other needs given. You can check your list\n or \nNow that I know about you, I can help you in selecting filters to further narrow down.";
            //   	}
            //   	else
            //   	{
            //   		sentence = "Thanks for providing these details  "+user_name+". Your list is sorted based on both body profile and concerns. You can check your list\n or \nNow that I know about you, I can help you in selecting filters to further narrow down.";
            //   	}
            let message ={
                text : sentence
            }
            return message;
        },
        displayProductCount : (count,sessionId)=>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"I have got "+ count +" styles matching your request. Check your list.\nContinue Chat in case you want Style Recommendations",
                        "buttons":[
                            {
                                "type" : "postback",
                                "title": "Continue Chat",
                                "payload":"continue_chat"
                            },
                            {
                                "type" : "web_url",
                                "title": "Check list",
                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "web_url",
                                "title": "Add more Filters",
                                "url":" https://www.prodx.in/fashion-bot/add_filters?session_id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        profileInfoMessage: () =>
        {
            let info_message = "I can further sort the list based on your Body Profile.";
            let message ={
                text : info_message
            }
            return message;
        },
        profileConfirmationQuestion : () =>
        {
            let messageData =
                {
                    "attachment":{
                        "type":"template",
                        "payload":{
                            "template_type":"button",
                            "text":"Is this you?",
                            "buttons":[
                                {
                                    "type" : "postback",
                                    "title": "It's me",
                                    "payload":"its_me"
                                },

                                {
                                    "type" : "postback",
                                    "title": "Not me",
                                    "payload":"not_me"
                                },
                                {
                                    "type" : "postback",
                                    "title": "Skip",
                                    "payload":"skip"
                                },
                            ]
                        }
                    }
                }
            return messageData;
        },
        sendButtonMessage : (text, values) =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":text,
                        "buttons": bot_questions.makeButtonOptions(values)
                    }
                }
            }
            return messageData;
        },
        noProductFoundMessage: () =>
        {
            let no_product_message = "Sorry! I have not found any products as per your request.";
            let message ={
                text : no_product_message
            }
            return message;
        },
        lessProducts: (sessionId, products_count) =>
        {
            let less_products_message = "Sorry, I can not assist you further as there are only "+products_count+" products as per your need";
            let message ={
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":less_products_message,
                        "buttons":[
                            {
                                "type" : "web_url",
                                "title": "Check list",
                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "web_url",
                                "title": "Check Latest Trends",
                                "url":" https://www.prodx.in/fashion-bot/trends?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "postback",
                                "title" : "Give Feedback",
                                "payload" : "feedback"
                            }
                        ]
                    }
                }
            };
            return message;
        },
        occasionFilterConflictQuestionButton : (filters, occasion, product_line )=>
        {

            let	text= "Do you want to see product for?"
            let options = [filters + " " +product_line,occasion + " " +product_line]
            return bot_questions.sendButtonMessage(text,options);
        },
        occasionFilterConflictQuestionText : (filters, occasion, product_line) =>
        {
            let sentence = "I am sorry, I usually don't recommend "+filters+" "+product_line+" for "+occasion+".";
            let message ={
                text : sentence
            };
            return message;
        },
        checkTrendsQuestion : (sessionId) =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"I have picked the latest trends for you. Check those. In case you want to reset the chat. type 'clear'",
                        "buttons":[
                            {
                                "type" : "web_url",
                                "title": "Check Trends",
                                "url":" https://www.prodx.in/fashion-bot/trends?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "postback",
                                "title" : "Give Feedback",
                                "payload" : "feedback"
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        askFiltersQuestion: (sessionId) => {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"Do you want to filter certain styles?",
                        "buttons":[
                            {
                                "type" : "web_url",
                                "title": "Yes! Add Filters",
                                "url":"https://www.prodx.in/fashion-bot/add_filters?session_id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },

                            {
                                "type" : "postback",
                                "title": "Style Me",
                                "payload":"no"
                            },
                            {
                                "type" : "web_url",
                                "title": "Check the list first",
                                "url":"https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                        ]
                    }
                }
            }
            return messageData;
        },
        filterOccasionConflictQuestion : (filters, occasion, product_line) => {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"How would you like to proceed?",
                        "buttons":[
                            {
                                "type" : "postback",
                                "title": "Show Recommendations",
                                "payload":"suggest_recommended"
                            },

                            {
                                "type" : "postback",
                                "title": "Go as per my likes",
                                "payload":"go_as_per_my_likes"
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        makeButtonOptions : (values,type,sessionId) => {
            let options = [];
            let if_type = {
                "type" : "web_url",
                "title": "select multiple",
                "url":"https://www.prodx.in/fashion-bot/refine_the_list?id="+sessionId+"&&type=adjective_module",
                "webview_height_ratio": "tall",
                "messenger_extensions": true,
            }
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
                            "payload": values[x]
                        }
                    }
                    else
                    {
                        option = {
                            "type" : "postback",
                            "title": values[x].value,
                            "payload": values[x].key
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
            let messageData ={
                "text": text,
                "quick_replies": makeQuickRepliesOptions(values)
            }
            return messageData;
        },
        askBodyConcernsQuestion : (text,sessionId) =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "image_aspect_ratio":"square",
                        "elements":
                            [{
                                "title":text,
                                "buttons":[
                                    {
                                        "type" : "web_url",
                                        "title": "Give Body Concerns",
                                        "url":"https://www.prodx.in/fashion-bot/bodyconcern?id="+sessionId,
                                        "webview_height_ratio": "full",
                                        "messenger_extensions": true,
                                    },
                                    {
                                        "type":"postback",
                                        "title":"No",
                                        "payload":"skip"
                                    }
                                ]
                            }]
                    }
                }
            }
            return messageData;
        },
        proceedFurtherQuestion : (sessionId, deals_status) =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"If you further want to refine your list, click on 'Continue Chat'.",
                        "buttons":[
                            {
                                "type" : "web_url",
                                "title": "Check list",
                                "url":"https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                "webview_height_ratio": "full",
                                "messenger_extensions": true,
                            },
                            {
                                "type" : "postback",
                                "title": "Continue Chat",
                                "payload" : "add_preferences"
                            }
                        ]
                    }
                }
            };
            // if(!deals_status)
            // {
            // 	let obj = {
            // 		"type" : "postback",
            // 		"title": "Check Deals in list",
            // 		"payload":"check_deals"
            //           };
            //           messageData.attachment.payload.buttons.push(obj);
            // }
            return messageData;
        },
        continueStatusQuestion :  (sessionId) => {
            let messageData =
                {
                    "attachment":{
                        "type":"template",
                        "payload":{
                            "template_type":"generic",
                            "elements":
                                [
                                    {
                                        "title":"How do you want to proceed further?",
                                        "buttons":[
                                            {
                                                "type" : "web_url",
                                                "title": "Check list",
                                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                                "webview_height_ratio": "full",
                                                "messenger_extensions": true,
                                            },
                                            {
                                                "type" : "postback",
                                                "title": "Continue Chat",
                                                "payload":"continue_chat"
                                            }
                                        ]
                                    }
                                ]
                        }
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
                            "payload":option.key
                        }]
                }
            });
            options.push({
                "title" : "select multiple",
                "buttons" : [
                    {
                        "type" : "web_url",
                        "title": "select multiple",
                        "url":"https://www.prodx.in/fashion-bot/refine_the_list?id="+sessionId+"&&type=adjective_module",
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true,
                    }]
            });
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "image_aspect_ratio":"square",
                        "elements": options
                    }
                }
            }
            return messageData;
        },
        bodyProfileShapeMessage : () =>
        {
            let message = {
                "text" : "What Body Shape describes you best?"
            }
            return message;
        },
        someIdentifiedQuestion: () => {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"button",
                        "text":"Have I understood it right?",
                        "buttons":
                            [
                                {
                                    "type" : "postback",
                                    "title": "Yes",
                                    "payload": "yes"
                                },
                                {
                                    "type" : "postback",
                                    "title": "No",
                                    "payload": "no"
                                }
                            ]
                    }
                }
            }
            return messageData;
        },
        bodyProfileShapeQuestion : () =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "image_aspect_ratio":"square",
                        "elements":[
                            {
                                "title":"What is Hourglass Shape?",
                                //"image_url": "https://www.prodx.in/fashion-bot/client/hourglass_cut.png",
                                "subtitle": "The bust and hips are basically the same size and your waist is well defined",
                                //"image_aspect_ratio":"square",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Hour glass",
                                        "payload":"hourglass"
                                    }
                                ]
                            },
                            {
                                "title":"What is Apple Shape?",
                                //"image_url": "https://www.prodx.in/fashion-bot/client/apple_cut.jpg",
                                "subtitle": "Waist is larger than bust and hips. The hips are narrow compared to shoulders",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Apple",
                                        "payload":"apple"
                                    }
                                ]
                            },
                            {
                                "title":"What is a Rectangle Shape?",
                                //"image_url": "https://www.prodx.in/fashion-bot/client/rectangle_cut.png",
                                "subtitle": "Bust and hips are basically the same size. Waist is only slightly slimmer",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Rectangle",
                                        "payload":"rectangle"
                                    }
                                ]
                            },
                            {
                                "title":"What is Pear Shape?",
                                //"image_url": "https://www.prodx.in/fashion-bot/client/pear_body_cut.png",
                                "subtitle": "Hips are larger than busts, and the waist gradually slopes out to the hips",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Pear",
                                        "payload":"pear"
                                    }
                                ]
                            },
                            {
                                "title":"Skip",
                                //"image_url": "https://www.prodx.in/fashion-bot/client/pear_body_cut.png",
                                //"subtitle": "The hips are larger than the bust, and the waist gradually slopes out to the hips",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Skip",
                                        "payload":"skip"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        bodyProfileSkinToneQuestion :() =>
        {
            let messageData = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "elements":[
                            {
                                "title":"Fair",
                                "image_url": "https://www.prodx.in/fashion-bot/client/fair.jpg",
                                //"subtitle": "that are curvy looking to give a curvy appearance to your body shape",
                                //"image_aspect_ratio":"square",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Fair",
                                        "payload":"fair"
                                    }
                                ]
                            },
                            {
                                "title":"Wheatish",
                                "image_url": "https://www.prodx.in/fashion-bot/client/wheatish.jpg",
                                //"subtitle": "with detailing and bright colors that will take away the attention from mid section",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Wheatish",
                                        "payload":"wheatish"
                                    }
                                ]
                            },
                            {
                                "title":"Dusky",
                                "image_url": "https://www.prodx.in/fashion-bot/client/dusky.jpg",
                                //"subtitle": "that are curvy looking to give a curvy appearance to your body shape",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Dusky",
                                        "payload":"dark"
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
                                        "payload":"skip"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        broadOccasionQuestion : (product_line, broad_occasions) =>
        {
            // let nothing_option = {
            // 	key: "nothing",
            // 	value: "No occasion in my mind"
            // };
            // broad_occasions.push(nothing_option);
            let text = "What occasion are you buying this for?";

            return bot_questions.sendQuickRepliesMessage(text,broad_occasions);
        },
        brandDealsStatusQuestion : (sessionId,deals_text,deals_option) =>
        {
            let messageData =
                {
                    "attachment":{
                        "type":"template",
                        "payload":{
                            "template_type":"generic",
                            "elements":
                                [
                                    {
                                        "title":deals_text,
                                        "buttons":[
                                            {
                                                "type" : "web_url",
                                                "title": "Check list",
                                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                                "webview_height_ratio": "full",
                                                "messenger_extensions": true,
                                            },
                                            {
                                                "type" : "postback",
                                                "title": deals_option,
                                                "payload":deals_option
                                            }
                                        ]
                                    }
                                ]
                        }
                    }
                }
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
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "elements":[
                            {
                                "title":"Premium brands",
                                "subtitle": "eg: And, Vero moda, Mango etc",
                                "buttons":[
                                    {
                                        "type" : "postback",
                                        "title": "Premium brands",
                                        "payload":"premium brands"
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
                                        "payload":"high end brands"
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
                                        "payload":"all brands"
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
                                        "url":" https://www.prodx.in/fashion-bot/refine_the_list?id="+sessionId+"&&type=deals",
                                        "webview_height_ratio": "full",
                                        "messenger_extensions": true,
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            return messageData;
        },
        brandDealsReasonMessage : (selected_values, product_line) =>
        {
            let sentence = "Ok, I have filtered "+selected_values.join(", ")+" from today's best deals in Myntra, Jabong, Voonik "+product_line;
            let message =  bot_questions.textMessages(sentence);
            return message;
        },
        occasionConflictQuestionText : (product_line, occasion)=>
        {
            let sentence = "I am sorry, I usually don't recommend "+product_line+" for "+occasion+".";
            let message ={
                text : sentence
            }
            return message;
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
            let age_message =  "How old are you "+user_name+"? (Give me a number in years)";
            let message ={
                text : age_message
            }
            return message;
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
            let message = {
                "text" : "What is your Skin Tone?"
            }
            return message;
        },
        displayReasonMessage: (text,sessionId, occasion_status, profile_status,concern_status) =>
        {
            let messageData =
                {
                    "attachment":{
                        "type":"template",
                        "payload":{
                            "template_type":"generic",
                            "elements":
                                [
                                    {
                                        "title":text,
                                        "buttons":[
                                            {
                                                "type" : "web_url",
                                                "title": "Check list",
                                                "url":" https://www.prodx.in/fashion-bot/products_list?id="+sessionId,
                                                "webview_height_ratio": "full",
                                                "messenger_extensions": true,
                                            }
                                        ]
                                    }
                                ]
                        }
                    }
                };
            if(!occasion_status || (occasion_status && !profile_status))
            {
                messageData.attachment.payload.elements[0].buttons.unshift({
                    "type" : "postback",
                    "title": "Continue Chat",
                    "payload":"continue_chat"
                });
            }
            return messageData;
        },
    }
    return bot_questions;
})();