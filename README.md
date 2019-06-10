# Zermelo CLI
[![https://nodei.co/npm/zermelo-cli.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/zermelo-cli.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/zermelo-cli)

CLI wrapper for Zermelo made by Sting Alleman


## Installation
`npm install --global zermelo-cli`
Then login to your school's zportal account:
`zermelo login`

#### Development
```bash
git clone https://github.com/stingalleman/zermelo-cli
cd zermelo-cli
npm install
npm link
zermelo
```

## Usage
```
Usage: zermelo [options] [command]

CLI wrapper for Zermelo, developed by Sting Alleman

Options:
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  token          input your own zermelo token
  login          login to your zportal account
  week           show how many appointments you have this week
  status         Show the status of your school's zportal portal
  conf           see whats listed in your conf
```
