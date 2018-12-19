let mongodb = require('mongodb');
let fs = require('fs');
let assert = require('assert');

module.exports = (function () {
    let MongoClient = mongodb.MongoClient;
    let url = 'mongodb://adminUser:password@35.200.171.190:27017/product_data';
    let main_database;
    MongoClient.connect(url, function (err, database) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', url);
            main_database = database;
        }
    });

    let mongo_functions = {
        // Connect to the db
        runQuery : (db_name, product_line, query, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(product_line);
            collection.find(query, {}).toArray(function (error, docs) {
                callback(docs, error)
                assert.equal(null, error);
            });
        },
        runQueryWithLimit : (db_name, product_line, query,from, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(product_line);
            collection.find(query, {}).skip(parseInt(from)*60).limit(60).toArray(function (error, docs) {
                callback(docs, error)
                assert.equal(null, error);
            });
        },
        aggregationQuery : (db_name, product_line, query, callback)=> {
            let db = main_database.db(db_name);
            let collection = db.collection(product_line);
            collection.aggregate(query, {"allowDiskUse": true}).toArray(function (error, docs) {
                assert.equal(null, error);
                // docs = docs.reduce(function(obj, doc) {
                //     obj[doc._id] = doc.docs
                //     return obj;
                // }, {});
                callback(docs, error);
            });
        },
        getCountQuery : (db_name, product_line, query, callback) =>{
            let db = main_database.db(db_name);
            let collection = db.collection(product_line);
            collection.count(query, function (error, number_of_docs) {
                callback(number_of_docs, error)
                assert.equal(null, error);
            });
        },
    };
    return mongo_functions;
})();