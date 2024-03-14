const fetch = require('node-fetch');
const firebase = require('../firebase');
const baseUrl = firebase.databaseURL;
const url = baseUrl + '/resources.json';
const Joi = require('joi');
const schema = require('../models/resource.model').resourceSchema;

/**
 * get all resources
 */
exports.getResources = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let organizationId = req.query.organizationId;
    return fetch(url)
        .then(data => data.json())
        .then(data => {
            if (organizationId) {
                let filteredData = {};
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key].hasOwnProperty('organizationId')) {
                            if (data[key].organizationId == organizationId) {
                                filteredData[key] = data[key];
                            }
                        }
                    }
                }
                res.json(filteredData);
            }
            else {
                res.json(data)
            }
        });
};

/**
 * create new resource
 */
exports.createResource = function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            res.status(422);
            res.json(err);
        }
        else {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }).then(data => data.json())
                .then(data => {
                    res.json(data)
                })
                .catch(
                    error => {
                        res.json(error);
                        console.log("error ", error);
                    })
        }
    })
}

/**
 * delete existing resource
 */
exports.deleteResource = function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    let deleteID = req.params.id;
    Joi.validate(deleteID, Joi.string(), function(err, value){
        if(err){
            res.status(422);
            res.json(err);
        }
        else{
            fetch(baseUrl + '/resources/' + deleteID + '.json', {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(data => data.json())
                .then(data => res.json(data))
                .catch(error => res.json(error));
        }
    })    
}

/**
 * update resource
 */
exports.updateResource = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let updateId = req.params.id;

    Joi.validate(req.body, schema, function(err, val){
        if(err){
            res.status(422);
            res.json(err);
        }
        else{
            fetch(baseUrl + '/resources/' + updateId + '.json', {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            })
                .then(data => data.json())
                .then(data => res.json(data))
                .catch(error => res.json(error));
        
        }
    })    
}