const fetch = require('node-fetch');
const firebase = require('../firebase');
const baseUrl = firebase.databaseURL;
const url = baseUrl + '/organization.json';
const Joi = require('joi');
const schema = require('../models/organization.model').organizationSchema;

/**
 * get organization
 */
exports.getOrganization = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    console.log("url = ", url);
    fetch(url)
        .then(data => data.json())
        .then(data => {
            res.json(data);
        });
}

exports.createOrganization = function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    Joi.validate(req.body, schema, function (err, value) {
        if (!err) {
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
        else {
            res.status(422);
            res.json(err);
        }
    })
}

exports.deleteOrganization = function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    let deleteID = req.params.id;

    Joi.validate(deleteID, Joi.string(), function(err, val){
        if(err){
            res.status(422);
            res.json(err)
        }
        else{
            fetch(baseUrl + '/organization/' + deleteID + '.json', {
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

exports.updateOrganization = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let updateId = req.params.id;

    Joi.validate(req.body, schema, function (err, data) {
        if (err) {
            res.json(err)
        }

        return fetch(baseUrl + '/organization/' + updateId + '.json', {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        })
            .then(data => data.json())
            .then(data => res.json(data))
            .catch(error => res.json(error));

    })

}