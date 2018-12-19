const request = require('request');

module.exports = (function () {
    // https://developers.facebook.com/docs/messenger-platform/send-api-reference
    const getFirstMessagingEntry = (body) => {
        // console.log(JSON.stringify(body, null, 2));
        const val = body.object === 'page' &&
            body.entry &&
            Array.isArray(body.entry) &&
            body.entry.length > 0 &&
            body.entry[0] &&
            body.entry[0].messaging &&
            Array.isArray(body.entry[0].messaging) &&
            body.entry[0].messaging.length > 0 &&
            body.entry[0].messaging[0];
        return val || null;
    };
    const sendRequest = (FB_PAGE_TOKEN, sender, messageData) =>{
        let parameters = {
            url: 'https://graph.facebook.com/v2.12/me/messages',
            qs: {
                access_token: FB_PAGE_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData
            }
        };
        request(parameters, function (error, response) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    };
    const sendBubble = (FB_PAGE_TOKEN, sender) => {
        let parameters = {
            url: 'https://graph.facebook.com/v2.12/me/messages',
            qs: {
                access_token: FB_PAGE_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {id: sender},
                sender_action: "typing_on"
            }
        };
        request(parameters,function (error, response) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
    const getUserDetails = (FB_PAGE_TOKEN, sender, callback)=> {
        let parameters = {
            url: "https://graph.facebook.com/v2.12/" + sender,
            qs: {
                access_token : FB_PAGE_TOKEN
            },
            method: "GET",
        };
        request(parameters, function(error, response, body) {
            if(error){
                console.log("error getting username")
            } else{
                var bodyObj = JSON.parse(body);
                console.log("UserDetails : ",bodyObj);
                callback(bodyObj);
            }
        })
    };
    const updateCallbackUrl = (FB_PAGE_TOKEN, )=>{
        let parameters = {
            url: 'https://graph.facebook.com/v2.12/me/messages',
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData
            }
        };
        request(parameters, function (error, response) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    };
    let facebook_functions = {
        verifyAccessToken : (FB_PAGE_TOKEN, callback) =>{
            let websites = ["https://www.prodx.in", "https://www.selekt.in", "https://www.selekt.in/chatbot-solution/", "https://www.selekt.in/chatbot-solution/newbot"];
            console.log("Inside verify access token function");
            request({
                url: 'https://graph.facebook.com/v2.12/me/messenger_profile',
                qs: {access_token: FB_PAGE_TOKEN},
                method: 'POST',
                json: {
                    "get_started": {
                        "payload":"GET_STARTED_PAYLOAD"
                    },
                    "whitelisted_domains": websites
                }
            },function (error, response) {
                let status = true;
                console.log(response['body']);
                if (error) {
                    console.log('Error sending message: ', error);
                    status = false;
                }
                else if(response.body.error) {
                    console.log('Error: ', response.body.error);
                    status = false;
                }
                callback(status);
            });
        },
        getFirstMessagingEntry : getFirstMessagingEntry,
        sendRequest : sendRequest,
        sendBubble : sendBubble,
        getUserDetails : getUserDetails,
    };
    return facebook_functions;
})();