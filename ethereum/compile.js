const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Delete the build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Get the contract and compile
const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(contractPath, 'utf-8');
const output = solc.compile(source, 1).contracts;

// Create build directory
fs.ensureDirSync(buildPath);

console.log(output);
// Write the output of the contracts to respective contract file
for(let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}
