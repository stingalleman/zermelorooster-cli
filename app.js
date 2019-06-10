#! /usr/bin/env node

const program = require('commander');
const request = require('request');
const inquirer = require('inquirer');
const chalk = require('chalk');
const moment = require('moment')
const fs = require('fs');
const configStore = require('configstore');
const pkg = require('./package.json');

const conf = new configStore(pkg.name, {
    token: '',
    schoolName: '',
    jsonData: {

    },
});

/*

        START CODE

*/
program
    .version('0.2.0')
    .description('CLI wrapper for Zermelo, developed by Sting Alleman')

// login cmd
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
        inquirer.prompt(questions).then(answers => {
            var jsonAnswers = JSON.stringify(answers)
            conf.set('token', answers.token)
            conf.set('schoolName', answers.schoolName)
            console.log(conf.get())
        })
    });

// week cmd
program
    .command('week')
    .description('show how many appointments you have this week')
    .action(function () {
        var ew = moment().endOf('week').unix()
        var sw = moment().startOf('week').unix()
        //https://alfrink.zportal.nl/api/v3/appointments?user=~me&start=1560246900&end=1560249900&access_token=62du45uvg5uqvqct5t0a9tmpgd
        var options = {
            url: 'https://' + conf.get('schoolName') + '.zportal.nl/api/v3/appointments?user=~me&start=' + sw + '&end=' + ew + '&access_token=' + conf.get('token'),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                jsonData = JSON.parse(body)
                console.log('You have ' + jsonData.response.totalRows + ' appointments this week')
            } else {
                console.log(error)
                console.log(body)
            }
        }
        request(options, callback);
    });


program.parse(process.argv);

// if no cmd/args given: show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}