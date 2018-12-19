const recastai = require('recastai').default;
module.exports = (function () {
    const recast_clients = {};
    let recast_bot_functions = {
        createRecastClient : (session_id, request_token)=>{
            recast_clients[session_id] = new recastai(request_token);
        },
        isRecastClientExists : (session_id)=> {
            return recast_clients.hasOwnProperty(session_id);
        },
        getRecastClient : (session_id)=>{
            return recast_clients[session_id];
        }
    };
    return recast_bot_functions;
})();