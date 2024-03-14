module.exports = function (db) {

    const fetch = require('node-fetch');
    var _ = require('underscore');
    var dateFormat = require('dateformat');
    const firebase = require('../firebase');
    const baseUrl = firebase.databaseURL;
    var url = baseUrl + '/events.json';
    let ref = db.ref('/events');
    const Joi = require('joi');
    const schema = require('../models/event.model').eventSchema;
    let Scheduler = require('@ssense/sscheduler');
    const scheduler = new Scheduler.Scheduler();
    const lodash = require('lodash');

    /**
     * get all events filtered by query parameters
     * @param {*} req 
     * @param {*} res 
     */
    function getEvents(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let startDate = req.query.hasOwnProperty('start-date') ? req.query['start-date'] : new Date('1971-1-1');
        let endDate = req.query.hasOwnProperty('end-date') ? req.query['end-date'] : new Date('2070-1-1');
        let resources = req.query.hasOwnProperty('resources') ? req.query['resources'].split(',') : [];
        let organizationId = req.query.hasOwnProperty('organizationId') ? req.query['organizationId'] : '';
        startDate = new Date(startDate).getTime();
        endDate = new Date(endDate).getTime();

        ref.orderByChild('date').startAt(startDate).endAt(endDate)
            .once('value', function (snapshot) {
                let refData = snapshot.val();
                let responseData = refData;

                if (resources.length) {
                    responseData = {};
                    for (let key in refData) {
                        if (refData.hasOwnProperty(key)) {
                            if (refData[key].hasOwnProperty("resources")) {
                                if (_.intersection(refData[key].resources.map(data => data.id), resources).length) {
                                    responseData[key] = refData[key];
                                }
                            }
                        }
                    }
                }

                if (organizationId) {
                    let newData = {};
                    for (let key in responseData) {
                        if (responseData[key].organizationId == organizationId) {
                            newData[key] = responseData[key]
                        }
                    }
                    responseData = newData;
                }

                for (let key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                        responseData[key].date = dateFormat(responseData[key].date, 'yyyy-mm-dd');
                    }
                }

                res.json(responseData);
            })
    }



    function checkIfResourceAvailable(dateTime, organizationId, timeObj, resources, duration) {
        return new Promise(function (resolve, reject) {
            ref.orderByChild('date').equalTo(dateTime)
                .once('value', function (snapshot) {
                    let refData = snapshot.val();
                    let responseData = refData;

                    if (resources.length) {
                        responseData = {};
                        for (let key in refData) {
                            if (refData.hasOwnProperty(key)) {
                                if (refData[key].hasOwnProperty("resources")) {
                                    if (_.intersection(refData[key].resources.map(data => data.id), resources.map(data => data.id)).length) {
                                        responseData[key] = refData[key];
                                    }
                                }
                            }
                        }
                    }

                    if (organizationId) {
                        let newData = {};
                        for (let key in responseData) {
                            if (responseData[key].organizationId == organizationId) {
                                newData[key] = responseData[key]
                            }
                        }
                        responseData = newData;
                    }


                    let date1 = new Date();
                    date1.setHours(timeObj.hour);
                    date1.setMinutes(timeObj.minute);
                    date1 = date1.getTime();

                    let date2 = new Date();
                    let filteredData = Object.keys(responseData).filter((key) => {
                        if (responseData[key].hasOwnProperty('time')) {
                            date2 = new Date();
                            date2.setHours(responseData[key].time.hour);
                            date2.setMinutes(responseData[key].time.minute);
                            date2 = date2.getTime();

                            let diff = Math.abs(date1 - date2);

                            if (diff < duration * 60 * 1000) {
                                return key;
                            }
                        }
                    });

                    if (filteredData.length) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                })
        })
    }

    function createEvent(req, res) {
        res.setHeader('Content-Type', 'application/json');
        req.body.date = new Date(req.body.date).getTime();

        Joi.validate(req.body, schema, function (err, value) {
            if (!err) {

                checkIfResourceAvailable(req.body.date, req.body.organizationId,
                    req.body.time, req.body.resources, 30).then((response) => {
                        if (response) {
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
                        else{
                            res.status(409);
                            res.json({
                                data: false,
                                error: 'Resource Not available'
                            })
                        }
                    })
            }
            else {
                res.status(422);
                res.json(err);
            }
        })
    }

    function deleteEvent(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let deleteID = req.params.id;

        Joi.validate(deleteID, Joi.string(), function (err, val) {
            if (err) {
                res.json(err);
            }
            else {
                return fetch(baseUrl + '/events/' + deleteID + '.json', {
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


    function updateEvent(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let updateId = req.params.id;
        req.body.date = new Date(req.body.date).getTime();

        Joi.validate(req.body, schema, function (err, val) {
            if (err) {
                res.json(err)
            }
            else {
                return fetch(baseUrl + '/events/' + updateId + '.json', {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(req.body)
                })
                    .then(data => data.json())
                    .then(data => res.json(data))
                    .catch(error => res.json(error))
            }
        })
    }



    /**
     * gives the available time slot for each day for each resource.
     * @param {*} req 
     * @param {*} res 
     */
    function getAvailableResources(req, res) {
        res.setHeader('Content-Type', 'application/json');
        let startDate = req.query.hasOwnProperty('start-date') ? req.query['start-date'] : '';
        let endDate = req.query.hasOwnProperty('end-date') ? req.query['end-date'] : '';
        let organizationId = req.query.hasOwnProperty('organizationId') ? req.query['organizationId'] : '';
        let startDateTime = new Date(startDate).getTime();
        let endDateTime = new Date(endDate).getTime();

        return new Promise((resolve, reject) => {
            db.ref('/resources').orderByChild('organizationId').equalTo(organizationId).once('value', function (snapshot) {
                let resources = snapshot.val();

                db.ref('/events').orderByChild('date').startAt(startDateTime).endAt(endDateTime)
                    .once('value', function (snapshot) {
                        try {
                            let events = snapshot.val();
                            let eventsCopy = JSON.parse(JSON.stringify(events));

                            // filter events by organization Id.
                            if (organizationId) {
                                eventsCopy = {};
                                for (let key in events) {
                                    if (events[key].organizationId == organizationId) {
                                        eventsCopy[key] = events[key];
                                    }
                                }
                                events = eventsCopy;
                            }

                            let resourceEvents = [];

                            let outputResourceEvent = {};

                            //loop all resources
                            Object.keys(resources).map(resourceId => {
                                outputResourceEvent[resourceId] = {
                                    events: {}
                                };
                                //select resource
                                let resource = resources[resourceId];

                                // loop all events
                                for (let key in events) {
                                    if (events.hasOwnProperty(key)) {
                                        if (events[key].hasOwnProperty("resources")) {
                                            if (_.intersection(events[key].resources.map(data => data.id), [resourceId]).length) {
                                                outputResourceEvent[resourceId]['events'][key] = events[key];
                                            }
                                        }
                                    }
                                }

                                // format data to get output structure Data Transfer object.
                                let dto = {
                                    from: startDate,
                                    to: endDate,
                                    duration: 30,
                                    interval: 30,
                                    schedule: {
                                        weekdays: {
                                            from: (resource.available.start.minute > 0) ? (resource.available.start.hour.toString() + ':' + resource.available.start.minute.toString()) : resource.available.start.hour.toString() + ':00',
                                            to: (resource.available.end.minute > 0) ? (resource.available.end.hour.toString() + ':' + resource.available.end.minute.toString()) : resource.available.end.hour.toString() + ':00',
                                            unavailability: [

                                            ]
                                        },
                                        allocated: Object.values(outputResourceEvent[resourceId]['events']).map(data => {
                                            return {
                                                from: (data.time.minute > 0) ? (dateFormat(data.date, 'yyyy-mm-dd') + ' ' + data.time.hour + ':' + data.time.minute) : (dateFormat(data.date, 'yyyy-mm-dd') + ' ' + data.time.hour + ':00'),
                                                duration: data.duration
                                            }
                                        }),
                                        unavailability: []
                                    }
                                };

                                let availability = scheduler.getAvailability(dto);
                                let resourceAvailability = {
                                    resource: {
                                        name: resource.name,
                                        id: resourceId
                                    },
                                    availability: availability
                                };

                                resourceEvents.push(resourceAvailability);
                            })

                            resolve(resourceEvents);
                        }
                        catch (err) {
                            reject(err);
                        }
                    })
            });
        })
    }


    /**
     * return a resource from the slot of available resources.
     * @param {*} req 
     * @param {*} res 
     */
    function selectResource(req, res) {
        req.query['start-date'] = dateFormat(new Date(req.query['date']).setHours(0, 0, 0, 0), 'yyyy-mm-dd');
        req.query['end-date'] = dateFormat(new Date(req.query.date).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000, 'yyyy-mm-dd');
        let time = req.query.time;

        let lowerTime = '';
        let upperTime = '';
        let timeArr = req.query.time.split(':');

        if (parseInt(timeArr[1]) == 0) {
            lowerTime = timeArr[0] + ':00';
            upperTime = timeArr[0] + ':00';
        }
        else if (parseInt(timeArr[1]) > 0 && parseInt(timeArr[1]) < 30) {
            lowerTime = timeArr[0] + ':00';
            upperTime = timeArr[0] + ':30';
        }
        else {
            lowerTime = timeArr[0] + ':30';
            upperTime = (parseInt(timeArr[0]) + 1) + ':00';
        }

        getAvailableResources(req, res).then((data) => {

            let isAvailable = '';
            let isAvailableLower = '';
            let isAvailableUpper = '';
            let selectedDTO = '';
            for (resource of data) {
                if (resource.availability.hasOwnProperty(req.query['start-date'])) {

                    // check if resource is available in lower boundry time
                    isAvailableLower = resource.availability[req.query['start-date']].find(data => {
                        return ((data.time == lowerTime) && data.available);
                    })

                    // check if resource is available in upper boundry time
                    isAvailableUpper = resource.availability[req.query['start-date']].find(data => {
                        return ((data.time == upperTime) && data.available);
                    })

                    isAvailable = isAvailableLower && isAvailableUpper;

                    if (isAvailable) {
                        selectedDTO = {
                            resource: {
                                name: resource.resource.name,
                                id: resource.resource.id
                            },
                            selectedTime: {
                                time: time,
                                available: true
                            },
                            date: req.query['start-date']
                        }
                        break;
                    }
                }
            }
                        
            if (isAvailable) {
                res.json(selectedDTO);
            }
            else {
                res.status(403);
                let aggregrateData = getAggregrateData(data);
                res.json({
                    resource: false,
                    data: 'Resource Not available',
                    availableData: aggregrateData
                });
            }
        })
    }


    //select random person and send its availability.
    function getAggregrateData(data){
        let randomResource = Math.floor(Math.random()*data.length);
        let availability = data[randomResource].availability;    
        return availability;
    }


    /**
     * The function randomly selects a person and sends its availability 
     * later it should searches all the resouces and return their aggregrate availability.
     * @param {*} req 
     * @param {*} res 
     */
    function getResourceAvailability(req, res){
        req.query['start-date'] = dateFormat(new Date(req.query['date']).setHours(0, 0, 0, 0), 'yyyy-mm-dd');
        req.query['end-date'] = dateFormat(new Date(req.query.date).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000, 'yyyy-mm-dd');
        
        getAvailableResources(req, res).then(function(data){
            let randomNumber = Math.floor(Math.random()*data.length);            
            res.json(data[randomNumber]);
        }).catch(function(err){
            res.json(err);
        });
    }


    return {
        getEvents: getEvents,
        createEvent: createEvent,
        deleteEvent: deleteEvent,
        updateEvent: updateEvent,
        selectResource: selectResource,
        getResourceAvailability: getResourceAvailability
    }

}