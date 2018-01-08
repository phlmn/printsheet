const fs = require('fs');
const yargs = require('yargs');

const printsheet = require('../src/index.js');

const generate = {
    command: ['generate', '$0'],
    desc: 'Generate the printsheet',
    builder: {
		config: {
			description: 'The config file.',
			default: 'printsheet.json'
        },
    },
    handler: argv => {
        const rawConfig = fs.readFileSync(argv.config);
        let loadedConfig = JSON.parse(rawConfig);

        printsheet.generatePrintsheet(loadedConfig);
    }
};

const init = {
    command: 'init',
    desc: 'Init config',
    handler: argv => {
        let defaultConfig = JSON.stringify(printsheet.defaultConfig, null, 2);
        fs.writeFileSync('printsheet.json', defaultConfig, {flag: 'wx'});
    }
};

yargs
    .command(generate)
    .command(init)
    .usage('printsheet [command] [options]')
    .help()
    .alias('h', 'help')
    .demandCommand()
    .strict()
    .argv;
