module.exports = (function () {
    let synonymsWords = {
        "ok"  : ["okay", "ok", "hmm", "haa"],
        "yes" : ["yes", "yeah"],
        "no"  : ["no", "no need", "none"],
        "skip": ['skip', "no need", "no", "not need"],
        "continue" : ['continue', 'continue chat', 'go further','proceed further',"continue_chat"]
    };
    let mapping_data = {
        productLineToDbMap :{
            "tops":"women_tops",
            "dresses" : "women_dresses",
            "jackets":"women_jackets",
            "jeans":"women_jeans",
            "tshirts":"women_tshirts",
            "shirts":"women_shirts",
            "sweaters":"women_sweaters",
            "shorts":"women_shorts",
            "blazers":"women_blazers",
            "capris":"women_capris",
            "kurtas":"women_kurta",
            "jeggings":"women_jeggings",
            "jumpsuits":"women_jumpsuits",
            "skirts":"women_skirts",
            "trousers":"women_trousers",
            "sweatshirts":"women_sweatshirts",
            "shrugs" : "women_shrugs"
        },
        broadCategoryMappping : {
            "footwear": {
                "synonyms":["footwear", "foot wear"],
                "product_lines" : ["flats", "heels", "casual shoes"]
            },
            "bottomwear": {
                "synonyms":["bottom wear", "bottomwear"],
                "product_lines" : ["jeans","skirts","shorts","trousers","capris","jeggings"]
            },
            "topwear": {
                "synonyms":["topwear", "top wear"],
                "product_lines" : ["dresses","tops","tshirts","shirts","jackets","blazers","sweaters","sweatshirts","jumpsuits"]
            },
            "innerwear":{
                "synonyms":["innerwear", "inner wear"],
                "product_lines" : []
            },
            "westernwear": {
                "synonyms":["westernwear", "western wear"],
                "product_lines" : ["jeans","skirts","shorts","trousers","capris","jeggings","dresses","tops","tshirts","shirts","jackets","blazers","sweaters","sweatshirts","jumpsuits"]
            },
            "ethnicwear": {
                "synonyms":["ethnicwear", "ethnic wear"],
                "product_lines" : []
            },
            "accessories":{
                "synonyms":["accessories"],
                "product_lines" : ["handbags"]
            },
            "nightwear" : {
                "synonyms":["nightwear", "night wear"],
                "product_lines" : []
            },
            "indianwear" : {
                "synonyms":["indianwear", "indian wear"],
                "product_lines" : []
            }
        },
        productLineSynonyms : {
            "blazers": [
                "blazers","blazer",
                "suits","suit"
            ],
            "capris": [
                "capris"
            ],
            "casual shoes": [
                "casual shoes",
                "shoe",
                "shoes"
            ],
            "dresses": [
                "gowns",
                "dress",
                "dresses"
            ],
            "flats": [
                "flats"
            ],
            "handbags": [
                "handbags","handbag"
            ],
            "heels": [
                "heels"
            ],
            "jackets": [
                "jacket",
                "jackets"
            ],
            "jeans": [
                "jean",
                "jeans"
            ],
            "jeggings": [
                "jeggings","jegging"
            ],
            "jumpsuits": [
                "jumpsuits","jumpsuit"
            ],
            "kurtas": [
                "kurta",
                "kurtas",
                "kurtha"
            ],
            "shirts": [
                "shirts","shirt"
            ],
            "shorts": [
                "shorts"
            ],
            "skirts": [
                "skirts", "skirt"
            ],
            "sweaters": [
                "sweaters", "sweater"
            ],
            "sweatshirts": [
                "sweatshirts", "sweatshirt"
            ],
            "tops": [
                "top",
                "tops"
            ],
            "trousers": [
                "trousers","trouser"
            ],
            "tshirts": [
                "tees",
                "tshirt",
                "tshirts",
                "t shirts",
                "t shirt"
            ],
            "shrugs" : [
                "shrugs",
                "shrug"
            ],
            saree : ["saree", "sarees"],
            churidars : ["churidars", "churidar"],
            lehenga : ["lehenga", "lehengas"],
            salwar : ["salwar","salwars"],
            dress_material : ["dress material", "indial dresses", "dress materials", "traditional dresses"],
            palazos : ["palazos"]
        },
        conflictWords : ["if","but","until","not","nor","yet","unless","doesn't","doesn t","don't","don t","didn t","didn't","can't","can t","whether","as musch as",
            "where as","because","besides","however","neverthless","nonetheless","instead","otherwise","rather","accordingly","consequently",
            "hence","meanwhile","furthermore","likewise"],
        stopWords : ["a","able","about","across","after","almost","also","am","among","an","any","are","as","at","be","because","been","best","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","often","on","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your","show","need","women","new","want"],
        brandDealValues : {
            "premium brands" : "premium brands",
            "premium brand" : "premium brands",
            "high end brands" : "high end brands",
            "high end brand" : "high end brands",
            "highend brands" : "high end brands",
            "highend brand" : "high end brands",
            "medium end brands" : "medium end brands",
            "medium end brand" : "medium end brands",
            "mediumend brands" : "medium end brands",
            "mediumend brand" : "medium end brands",
            "all brands" : "all brands",
        },
        undoWords : ['undo', 'go back', 'goto previous step', 'goback', 'previous state',"get back","getback"],
        resetWords : ['restart', 'reset', 'clear', 'start from beginning', 'start again', 'close chat', "start over"],
        helpWords : ['help', 'suggest', 'suggestion', 'help me'],
        greetWords : ['hi', 'hello', 'hey'],
        trendWords : ["trend","trending","trends"],
        dealWords : ["deals", "deal", "offers"],
        previousQuestionEntities : {
            aboutMe : {
                "ok" : synonymsWords["ok"]
            },
            instructionMessage : {
                "ok" : synonymsWords["ok"]
            },
            someIndentifiedMessage : {
                "yes" : synonymsWords['yes'],
                "no"  : synonymsWords['no']
            },
            resetQuestion:{
                "yes" : synonymsWords['yes'].concat(synonymsWords['reset']),
                "no"  : synonymsWords['no']
            },
            filterOccasionConflictQuestion : {
                "recommended" : ["show recommended", "recommended", "recommend", "show recommendations", "recommendations","suggest_recommended"],
                "my_likes" : ["as per my likes", "my likes", "as my likes", "my like", "go as per my likes", "go","go_as_per_my_likes","as_my_likes"]
            },
            changeProductLineQuestion : {
                "yes": synonymsWords['yes'],
                "no" : synonymsWords['no']
            },
            filtersQuestion : {
                "no": synonymsWords['no'].concat(synonymsWords['continue'].concat(['add preferences', 'preferences', "add_preferences","style_me","style me","style"]))
            },
            occasionStatusQuestion: {
                "yes": synonymsWords['yes'],
                "no" : synonymsWords['no']
            },
            continueChatQuestion : {
                "continue" : synonymsWords['continue']
            },
            occasionQuestion: {
                "skip": synonymsWords['skip']
            },
            broadOccasionQuestion: {
                "skip": synonymsWords['skip']
            },
            profileInterestQuestion : {
                "yes" : synonymsWords['yes'],
                "no" : synonymsWords['no']
            },
            userProfileStatusQuestion : {
                "its_me":["it s me","its me", 'mine', "its_me"],
                "not_me": ["not me", "not mine", "not_me", "not"],
                "skip" : synonymsWords['skip']
            },
            heightQuestion:{
                "skip" : synonymsWords['skip']
            },
            skintoneQuestion:{
                "skip" : synonymsWords['skip']
            },
            bodyshapeQuestion:{
                "skip" : synonymsWords['skip']
            },
            bodyConcernQuestion:{
                "skip": synonymsWords['skip'].concat(synonymsWords['no'])
            },
            proceedFurtherQuestion:{
                "continue" : synonymsWords['continue'].concat(['add preferences', 'preferences', "add_preferences"])
            },
            trendsQuestion : {
                "feedback" : ["feedback", "give feedback", "give_feedback"]
            },
            feedbackQuestion : {
                "loved it" : ["good", "loved_it", "loved", "awesome", "loved it","loved_it"],
                "bad"   : ["bad", "worst"],
                "others" : ["feedback", "others", "other"]
            }
        }
    };
    return mapping_data;
})();