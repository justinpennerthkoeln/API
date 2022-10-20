const express = require('express')
const fetch = require('node-fetch');
const axios = require("axios");
const app = express()
const {covidHistory, countries} = require("./covidApi.js")

app.get('/history', async function (req, res) {
    res.send(await covidHistory(req, res));
    // let countriesRes = await countries(req, res);
    // res.send(await countriesRes.response);
})


app.listen(3000);