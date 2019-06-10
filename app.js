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
    authCode: ''
});

const consoleError = chalk.red('ERROR | ');
const consoleSuccess = chalk.green('SUCCESS | ')

/*

        START CODE

*/
program
    .version('1.0.1')
    .description('CLI wrapper for Zermelo, developed by Sting Alleman')

// token cmd
program
    .command('token')
    .description('input your own zermelo token')
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
            conf.set('token', answers.token)
            conf.set('schoolName', answers.schoolName)
        })
    });

//login cmd
program
    .command('login')
    .description('login to your zportal account')
    .action(function () {
        var questions = [{
                type: "input",
                name: "schoolName",
                message: "What's your zportal school name?"
            },
            {
                type: "input",
                name: "authCode",
                message: "What's your zportal authorization code?"
            }
        ]
        inquirer.prompt(questions).then(answers => {
            conf.set('authCode', answers.authCode)
            conf.set('schoolName', answers.schoolName)

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    jsonData = JSON.parse(body)
                    conf.set('token', jsonData.access_token)
                    console.log(consoleSuccess + "Successfully received and stored your Zermelo API token!")
                } else {
                    console.log(consoleError + "Something went wrong! Maybe you made a typo? And make sure you don't have any spaces in the authorization code!")
                }
            }
            var payload = {
                grant_type: 'authorization_code',
                code: conf.get('authCode')
            };

            request.post('https://' + conf.get('schoolName') + '.zportal.nl/api/v3/oauth/token', {
                form: payload
            }, callback)

        })
    });

// week cmd
program
    .command('week')
    .description('show how many appointments you have this week')
    .action(function () {
        var ew = moment().endOf('week').unix()
        var sw = moment().startOf('week').unix()
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

//status cmd
program
    .command('status')
    .description("Show the status of your school's zportal portal")
    .action(function () {
        var options = {
            url: 'https://' + conf.get('schoolName') + '.zportal.nl/api/v3/status/status_message',
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                jsonData = JSON.parse(body)
                console.log(consoleSuccess + body)
            } else {
                console.log(consoleError + "Something went wrong!")
            }
        }
        request(options, callback);
    });

//conf cmd
program
    .command('conf')
    .description('see whats listed in your conf')
    .action(function () {
        var confJson = JSON.stringify(conf.get(), null, '  ')
        console.log(confJson)
    })


program.parse(process.argv);

// if no cmd/args given: show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}