#! /usr/bin/env node

const program = require('commander')
const request = require('request')
const fs = require('fs')
const config = require('./lib/config.json')

program
    .version('0.1.0')

program
    .command('login')
    .description('login to your zermelo account')
    .action(function (login) {
        const options = {
            method: "POST",
            url: "https://alfrink.zportal.nl",
            headers: {
                grant_type: "authorization_code",
                code: config.authCode
            }
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                console.log(info)
            } else {
                console.log("nothing!")
            }
        }
        request(options, callback)
    });
 /*program
    .command(schedule)
    .description('view your own schedule for this week')
    .action(function (schedule) {

    }) */

program.parse(process.argv);