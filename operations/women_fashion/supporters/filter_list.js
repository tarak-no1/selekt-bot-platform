const MONGO = require('../../../config/mongoQueries');
const HELPER = require('../../helper');
const ELASTICSEARCH = require('../../../config/elasticSearch');
const ProductFilters = require('../../../public/json/all_productline_to_filters')
const WordMapping = require('../../../public/json/word_mapping.json');
let feed_attributes = {};
var fs = require('fs');
function getFilterCount(product_line, user_context, require_attribute, callback)
{
    console.log("\n\n\n =================== In generateFilterQuery function");
    var already_having_attributes = JSON.parse(JSON.stringify(user_context["filters"]));
    //query for filters
    let cnt_filters = user_context["filters"];
    console.log("product_line",product_line);

    let response = JSON.parse(JSON.stringify(ProductFilters[product_line]));
    if(!require_attribute && require_attribute!=""){
        require_attribute = {
            "attribute": "brand",
            "display_name": "brand"
        };
    }
    else
    {
        require_attribute["attribute"] = require_attribute["key"];
    }
    getEachQuery(response,function (filter_list) {
        callback(filter_list);
    });
    function getEachQuery(response,callback) {
        // response = [response[0]];
        let context = JSON.parse(JSON.stringify(user_context));
        var cnt_range = context["range"];
        cnt_filters = context["filters"];
        let attribute = require_attribute["attribute"];
        if(already_having_attributes.hasOwnProperty(attribute))
        {
            delete cnt_filters[attribute];
        }
        else if(attribute=="discount_price"||attribute == "discount_percent")
        {
            if(cnt_range.hasOwnProperty(attribute))
                delete cnt_range[attribute];
        }
        context["filters"] = cnt_filters;
        context["range"] = cnt_range;
        let query = HELPER.buildQuery(context);
        //console.log(JSON.stringify(query,null, 2))
        //console.log(query);
        let aggregation_query =[];
        aggregation_query.push(query[0]);
        aggregation_query.push({"$group":{"_id":"$product_filter."+require_attribute["attribute"],count:{$sum:1}}});
        console.log(JSON.stringify(aggregation_query,null, 2))
        let promise = getCounts(product_line, aggregation_query, require_attribute['attribute'], require_attribute['display_name']);
        promise.then(function(data)
        {
            let filter_list = response.map(function(filter){
                let obj = {
                    "key":filter['attribute'],
                    "display_name" : filter["display_name"],
                    "values": []
                };
                if(data['key']==filter['attribute']){
                    obj['values'] = data['values']
                }
                return obj;
            });
            filter_list = filter_list.sort(function(a, b){
                let dp1 = a["display_name"],dp2 = b["display_name"];
                if (dp1 > dp2) return 1;
                if (dp1 < dp2) return -1;
                return 0;
            });
            callback(filter_list);
        }, function (err) {
            console.log(err);
        });


    }
    function getCounts(product_line,aggregation_query,attribute,display_name)
    {
        return new Promise (function(resolve,reject){
            //console.log(JSON.stringify(aggregation_query,null,2));
            MONGO.aggregationQuery('product_data',product_line, aggregation_query, (result_set, error)=>{
                if(!error)
                {
                    let obj ={
                        key : attribute,
                        display_name : display_name,
                        values : []
                    };

                    if(obj["key"]=="discount_price")
                    {
                        let count_0_500 = 0, count_500_1000 = 0,count_1000_1500 = 0,count_1500_2000=0,count_2000_2500=0,count_2500_above=0;
                        for(let i in result_set)
                        {
                            let filter_obj = result_set[i];
                            if(filter_obj["_id"]>=0 && filter_obj["_id"]<500)
                            {
                                count_0_500+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=500 && filter_obj["_id"]<1000)
                            {
                                count_500_1000+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=1000 && filter_obj["_id"]<1500)
                            {
                                count_1000_1500+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=1500 && filter_obj["_id"]<2000)
                            {
                                count_1500_2000+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=2000 && filter_obj["_id"]<2500)
                            {
                                count_2000_2500+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=2500)
                            {
                                count_2500_above+=filter_obj["count"];
                            }
                        }
                        if(count_0_500!=0)
                        {
                            obj["values"].push({"key":"0 to 500","doc_count":count_0_500,check_status:false});
                        }
                        if(count_500_1000!=0)
                        {
                            obj["values"].push({"key":"500 to 1000","doc_count":count_500_1000,check_status:false});
                        }
                        if(count_1000_1500!=0)
                        {
                            obj["values"].push({"key":"1000 to 1500","doc_count":count_1000_1500,check_status:false});
                        }
                        if(count_1500_2000!=0)
                        {
                            obj["values"].push({"key":"1500 to 2000","doc_count":count_1500_2000,check_status:false});
                        }
                        if(count_2000_2500!=0)
                        {
                            obj["values"].push({"key":"2000 to 2500","doc_count":count_2000_2500,check_status:false});
                        }
                        if(count_2500_above!=0)
                        {
                            obj["values"].push({"key":"2500 or above","doc_count":count_2500_above,check_status:false});
                        }
                    }
                    else if(obj["key"]=="discount_percent")
                    {
                        let count_lessthan_10 = 0, count_greater_10 = 0,count_greater_20 = 0,count_greater_30=0;
                        let count_greater_40=0,count_greater_50=0,count_greater_60=0,count_greater_70=0;
                        for(let i in result_set)
                        {
                            let filter_obj = result_set[i];
                            if(filter_obj["_id"]<10)
                            {
                                count_lessthan_10+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=10)
                            {
                                count_greater_10+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=20)
                            {
                                count_greater_20+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=30)
                            {
                                count_greater_30+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=40)
                            {
                                count_greater_40+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=50)
                            {
                                count_greater_50+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=60)
                            {
                                count_greater_60+=filter_obj["count"];
                            }
                            if(filter_obj["_id"]>=70)
                            {
                                count_greater_70+=filter_obj["count"];
                            }
                        }
                        if(count_lessthan_10!=0)
                        {
                            obj["values"].push({"key":"Less than 10%","doc_count":count_lessthan_10,check_status:false});
                        }
                        if(count_greater_10!=0)
                        {
                            obj["values"].push({"key":"10% or more","doc_count":count_greater_10,check_status:false});
                        }
                        if(count_greater_20!=0)
                        {
                            obj["values"].push({"key":"20% or more","doc_count":count_greater_20,check_status:false});
                        }
                        if(count_greater_30!=0)
                        {
                            obj["values"].push({"key":"30% or more","doc_count":count_greater_30,check_status:false});
                        }
                        if(count_greater_40!=0)
                        {
                            obj["values"].push({"key":"40% or more","doc_count":count_greater_40,check_status:false});
                        }
                        if(count_greater_50!=0)
                        {
                            obj["values"].push({"key":"50% or more","doc_count":count_greater_50,check_status:false});
                        }
                        if(count_greater_60!=0)
                        {
                            obj["values"].push({"key":"60% or more","doc_count":count_greater_60,check_status:false});
                        }
                        if(count_greater_70!=0)
                        {
                            obj["values"].push({"key":"70% or more","doc_count":count_greater_70,check_status:false});
                        }
                    }
                    else
                    {
                        for(let i in result_set)
                        {
                            if(result_set[i]["_id"]!="na"&&result_set[i]["_id"]!=null&&result_set["_id"]!="")
                            {
                                let status = false;
                                if(already_having_attributes.hasOwnProperty(obj["display_name"]))
                                {
                                    already_having_attributes[obj["display_name"]].forEach(function(value){
                                        if(result_set[i]["_id"]==value)
                                        {
                                            status = true;
                                            return;
                                        }

                                    })
                                }
                                obj["values"].push({check_status:status,doc_count:result_set[i]["count"],key:result_set[i]["_id"]});
                            }
                        }
                    }
                    obj["values"].sort((a, b) => b.doc_count - a.doc_count);
                    resolve(obj)
                }
                else
                    reject(error);
            });
        });
    }
}


module.exports = (function () {
    let filter_functions = {
        getBenefitFilterConflictDetails : (product_line, benefit, filters, callback)=>{
            let elastic_benefits_queries =
                {
                    index : "styling_rules",
                    type : "combined_benefit_rules",
                    body : {
                        "size": 1,
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match_phrase":{
                                            "product_line_name" : product_line
                                        }
                                    },
                                    {
                                        "match_phrase":{
                                            "benefit_backend_key" : benefit
                                        }
                                    }
                                ]
                            }
                        }
                    }
                };
            let output_obj = {
                conflict_filters : {},
                recommended_filters : {}
            };
            ELASTICSEARCH.runElasticQuery(elastic_benefits_queries).then(function (result) {
                if(result.total>0){
                    let source = result.hits[0]['_source'];
                    let must_haves = source['must_have'];
                    console.log("inside occasion filter conflict");
                    Object.keys(filters).forEach(function (attribute) {
                        let attribute_values = must_haves.map(function (attr_obj) {
                            let require_attribute_value = attr_obj.filter(function (attr_value_obj) {
                                return attr_value_obj.attribute_name == attribute;
                            });
                            return require_attribute_value.map(function (attr_value_obj) {
                                return attr_value_obj.attribute_value;
                            });
                        });
                        attribute_values = attribute_values.filter(function (data) {
                            return data.length>0;
                        });
                        if(attribute_values.length>0) {
                            let intersection_array = HELPER.getArrayIntersection(filters[attribute], attribute_values[0]);
                            if (intersection_array.length == 0) {
                                output_obj['conflict_filters'][attribute] = filters[attribute];
                                output_obj['recommended_filters'][attribute] = attribute_values[0];
                            }
                        }
                    });
                }
                callback(output_obj);
            }, function (err) {
                callback(output_obj);
            })
        },
        getFilterCount : getFilterCount
    };
    return filter_functions;
})();