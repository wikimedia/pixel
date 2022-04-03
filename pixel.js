#!/usr/bin/env node

const execSync = require('child_process').execSync;
execSync( 'docker-compose start' );

const spawn = require('child_process').spawn;
const command = spawn( `docker-compose`,  [`exec`, `mediawiki`, `/scripts/main.js`, ...process.argv.slice(2)] );

let savedOutput = '';

command.stdout.on('data', data => {
   const strData = data.toString();
   console.log(strData);
   savedOutput += strData;
});

command.stderr.on('data', data => {
   assert(false, 'Not sure what you want with stderr');
});

command.on('close', code => {
   console.log('Child exited with', code, 'and stdout has been saved');
   if (code === 0) {
      spawn('docker-compose', ['run', 'visual-regression', 'test', '--config', 'backstop.config.js'], { stdio: 'inherit' });
   }
   // at this point 'savedOutput' contains all your data.
});

