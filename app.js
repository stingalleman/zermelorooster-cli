#! /usr/bin/env node

const program = require('commander');
const ora = require('ora')
const request = require('request');
const inquirer = require('inquirer');
const chalk = require('chalk');
const moment = require('moment')
const fs = require('fs');
const configStore = require('configstore');
const pkg = require('./package.json');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const conf = new configStore(pkg.name, {
    token: '',
    schoolName: '',
    authCode: ''
});

const consoleError = chalk.red('ERR! ');
const consoleSuccess = chalk.green('SUCCESS! ')
const consoleWarn = chalk.yellow('WARN! ')

const endpoint = 'https://' + conf.get('schoolName') + '.zportal.nl'

/*

        START CODE

*/
program
    .version('1.1.0')
    .description('CLI wrapper for Zermelo, developed by Sting Alleman')

// token cmd
program
    .command('token')
    .description('input a zermelo token')
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
                message: "What's your Zermelo school name?"
            },
            {
                type: "input",
                name: "authCode",
                message: "What's your Zermelo authorization code?"
            }
        ]
        inquirer.prompt(questions).then(answers => {
            const spinner = ora("Logging in to your Zermelo account...").start()
            spinner.color = 'green'
            conf.set('authCode', answers.authCode)
            conf.set('schoolName', answers.schoolName)

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    jsonData = JSON.parse(body)
                    conf.set('token', jsonData.access_token)
                    spinner.stop()
                    console.log(consoleSuccess + "Successfully received and stored your Zermelo API token!")
                } else {
                    spinner.stop()
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
        const spinner = ora('Sending HTTP request...').start()
        spinner.color = 'green'
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
                spinner.stop()
                console.log('You have ' + jsonData.response.totalRows + ' appointments this week')
            } else {
                spinner.stop()
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
        const spinner = ora('Sending HTTP request...').start()
        spinner.color = 'green'
        var options = {
            url: endpoint + '/api/v3/status/status_message',
        }
        console.log(options.url)

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                jsonData = JSON.parse(body)
                spinner.stop()
                console.log(consoleSuccess + body)
            } else {
                spinner.stop()
                console.log(consoleError + "Something went wrong! Did you run zermelo login yet?")
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
        console.log('  ')
        console.log('current endpoint: ' + endpoint)
        console.log('  ')
        console.log(consoleWarn + 'Do not share your token! Anybody that has access to this token can abuse your account using the API!')
    })

//login cmd
program
    .command('add')
    .description('add an appointment to an user')
    .action(function () {
        var questions = [{
                type: "input",
                name: "subject",
                message: "Subject"
            },
            {
                type: "input",
                name: "class",
                message: "Class (example: b2.2c)"
            },
            {
                type: "input",
                name: "class",
                message: ""
            }
        ]
        inquirer.prompt(questions).then(answers => {
            const spinner = ora("Logging in to your Zermelo account...").start()
            spinner.color = 'green'
            conf.set('authCode', answers.authCode)
            conf.set('schoolName', answers.schoolName)

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    jsonData = JSON.parse(body)
                    conf.set('token', jsonData.access_token)
                    spinner.stop()
                    console.log(consoleSuccess + "Successfully received and stored your Zermelo API token!")
                } else {
                    spinner.stop()
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

program.parse(process.argv);

// if no cmd/args given: show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}