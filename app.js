#! /usr/bin/env node

var program = require('commander');
var request = require('request');
var inquirer = require('inquirer');
var chalk = require('chalk');
var moment = require('moment')
var fs = require('fs');
var config = require('./lib/config.json');


program
    .version('0.1.1')
    .description('CLI wrapper for Zermelo, developed by Sting Alleman')

program
    .command('login')
    .description('login to zermelo')
    .action(function () {
        var questions = [{
                type: "input",
                name: "token",
                message: "What's your Zermelo token?"
            },
            {
                type: "input",
                name: "schoolName",
                message: "What's your zportal school name?"
            }
        ]
        inquirer.prompt(questions).then(tokenAnswer => {
            var newConfig = {
                ...config,
                ...tokenAnswer
            };
            var newConfigJSON = JSON.stringify(newConfig, null, '  ');
            fs.writeFileSync('./lib/config.json', newConfigJSON)
        })
    });

program
    .command('week')
    .description('show how many appointments you have this week')
    .action(function () {
        var ew = moment().endOf('week').unix()
        var sw = moment().startOf('week').unix()
        //console.log(ew + ' ' + sw)
        //https://alfrink.zportal.nl/api/v3/appointments?user=~me&start=1560246900&end=1560249900&access_token=62du45uvg5uqvqct5t0a9tmpgd
        var options = {
            url: 'https://' + config.schoolName + '.zportal.nl/api/v3/appointments?user=~me&start=' + sw + '&end=' + ew + '&access_token=' + config.token,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                fs.writeFileSync('./lib/data.json', body, 'utf8')
                jsonData = JSON.parse(body)
                console.log('You have ' + jsonData.response.totalRows + ' appointments this week')
            }
        }
        request(options, callback);
    });




/*program
   .command(schedule)
   .description('view your own schedule for this week')
   .action(function (schedule) {

   }) */

program.parse(process.argv);

// if no cmd/args given: show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
  