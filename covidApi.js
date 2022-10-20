const express = require('express')
const app = express()
const fetch = require("node-fetch")
const error = require("./error.json")


/**
 * function to get cases from a day in a Country
 * @param {*} req URL with country
 * @param {*} res 
 * @param {*} assembledDay assembled day from new Date()
 * @returns cases of from a Single day in a Specific Country
 */
async function day(req, res, assembledDay) {
    const url = 'https://covid-193.p.rapidapi.com/history?day=' + assembledDay +'&country='+ evalCountry(req.query.country);

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'af2100d539mshc675720ecb65707p101b6djsnf2a14fe329ad',
        'X-RapidAPI-Host': 'covid-193.p.rapidapi.com'
      }
    };

    function evalCountry(country) {
        if(country==null) {
            return "Germany";
        } else return country;
    }

    fetch(url, options)
    	.then(res => res.json())
    	.then(json => {return json.response})
    	.catch(err => console.error('error:' + err));

    try {
        let response = await fetch(url, options);
        response = await response.json();
        if(response.response[0] != 0) {return response.response[0]} else {return response.response[1]}
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: `Internal Server Error.`});
    }
}


/**
 * function to get all Countries
 * @param {*} req URL
 * @param {*} res 
 * @returns all countries listed in API
 */
async function countries(req, res) {
    const url = 'https://covid-193.p.rapidapi.com/countries';

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'af2100d539mshc675720ecb65707p101b6djsnf2a14fe329ad',
        'X-RapidAPI-Host': 'covid-193.p.rapidapi.com'
      }
    };

    fetch(url, options)
    	.then(res => res.json())
    	.then(json => {return json.response})
    	.catch(err => console.error('error:' + err));

    try {
        let response = await fetch(url, options);
        response = await response.json();
        return response;
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: `Internal Server Error.`});
    }
}


/**
 * to get cases from a whole week from a spesific country
 * @param {*} req 
 * @param {*} res 
 * @returns the cases from a whole week
 */
async function covidHistory(req, res) {
    let returnedDays = new Array();
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let countDays = new Date(year, month-1, 0).getDate();

    let counter = 0;
    for(let i = 0; i<7; i++) {
        if(date.getDate()-i > 0) {
            let newDate = date.getDate()-i;
            let assembledDay = year + "-" + month + '-' + newDate;
            returnedDays.push(await day(req, res, assembledDay));
        } else {
            let newDate = countDays-counter;
            let newMonth = month-1;
            let assembledDay = year + "-" + newMonth + '-' + newDate;
            console.log(assembledDay);
            counter++;
            returnedDays.push(await day(req, res, assembledDay));
        }
    }

    let formatedReturnedDays = await formatJson(returnedDays);

    return formatedReturnedDays;
}


/**
 * @param {*} json json to format into important info json
 * @returns json with only the infos we need, also gives back an Error msg, if the current day has no Entry yet
 */
async function formatJson(json) {
    let filteredjs = new Array();
    for(let i = 0; i < json.length; i++) {
        let response = json[i];
        if(response != null) {
            let country = response.country
            let population = response.population;
            let cases = response.cases;
            let day = response.day;
            filteredjs.push({country, population, cases, day})
        } else {filteredjs.push({Error:error[0].covidApi.noEntry})}
    }
    return filteredjs;
}



module.exports = {covidHistory, countries};