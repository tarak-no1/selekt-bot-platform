const API_SUPPORTER = require('../api_supporter');
let express = require('express');
let router = express.Router();
/* to retreive body concerns from web view and process user answer*/
router.post('/bodyconcerns',(req ,res) =>
{
    console.log("req.body")
    let result= req.body;
    API_SUPPORTER.processBodyConcerns(result);
});
/*api for body concern page to send use*/
router.get('/bodyconcern',(req,res) =>
{
    let body = req.query;
    console.log(body.id);
    res.render('./views/server_files/body_concerns',{source : body.id});
});

/*rendering show products page*/
router.get('/products_list',(req,res)=>{
    let body = req.query;
    console.log(body.id);
    let session_id = body.id;
    console.log("api",session_id);
    API_SUPPORTER.getProductList(session_id,function (source){
        console.log(source);
        res.render('./views/server_files/show_products',{source : JSON.stringify(source)});
    });
});

/* api for sent product list data*/
router.post('/products_lists',(req,res)=>
{
    let result= req.body;
    console.log(result)
    API_SUPPORTER.sendProductList(result,function(result) {
        res.send(result);
    });
});

/*api for sending trends page*/
router.get('/trends',(req,res)=>
{
    let body = req.query;
    API_SUPPORTER.processGetTrends(body,function (source) {
        res.render('./views/server_files/show_products',{source : JSON.stringify(source)});
    });
    //console.log(products_data);
});

// rendering add filters page
router.get("/add_filters", function(req, res)
{
    let data = req.query;
    let session_id = data["session_id"];
    res.render("./views/server_files/filters", {"session_id":session_id});
});

//api for sending available filters
router.post('/get_filters', function(req, res){
    let data = req.body;
    console.log("in get Filters");
    console.log(data);
    API_SUPPORTER.processGetFilters(data,function (result_data) {
        res.send(result_data);
    });
});

//updating filters
router.post("/update_filters", function(req, res)
{

    let data = req.body;
    console.log("update filters : ",data)
    API_SUPPORTER.processUpdateFilters(data);
});

//get api for display adjective reasons
router.get("/adjective_reason", function(req, res)
{
    let query = req.query;
    console.log(query);
    API_SUPPORTER.getAdjectiveReasons(query,function(result){
        res.render("./views/server_files/adjective_reasons",{"source":JSON.stringify(result)});
    });
});

//get refine list questions
router.get('/refine_the_list',(req,res)=>
{
    let body = req.query;
    console.log(body.id);
    API_SUPPORTER.getRefineList(body,function(data){
        res.render('./views/server_files/choose_type',{source : JSON.stringify(data)});
    });
});

//api process refine list answers
router.post('/refine_the_list_answers',(req,res)=>{
    var result=req.body;
    API_SUPPORTER.processRefineListAnswers(result);
})

//main messanger handler
router.post('/webhook', (req, res)=>{
    // console.log("In POST sWebhook");
    let messaging = null;
    // console.log(JSON.stringify(req.body, null, 2));
    if (req.body.object === 'page') {
        //console.log(JSON.stringify(req.body.entry,null,2));
        //getting each message from user
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if ((event.message) || (event.postback)) {
                    //getting message and postback events from page.this event contains details of user like sender_id,message_type,message
                    messaging = event;
                }
            });
        });
    }
    if(messaging)
    {
        console.log(JSON.stringify(messaging, null, 2));
        // processing the FB Message
        API_SUPPORTER.processFBMessage(messaging);
    }
    res.sendStatus(200).end();
});
module.exports = router;