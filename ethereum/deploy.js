const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
//const { interface, bytecode } = require('./compile');
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'level acquire skirt whip note august usual doctor lend please few mom',
    'https://rinkeby.infura.io/Hc5incaKu3aiZwscTToP'
);

const web3 = new Web3(provider);

//console.log(interface);
//console.log("========================================================");
//console.log(bytecode);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    //console.log("Available Accounts: ");
    //console.log(accounts);

    console.log("Attempting to deploy from: "+accounts[0])

    const factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: "0x"+ compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' })
        .catch((err) => {
            console.log("Some error occurred");
            console.log(err);
        });
    //console.log(interface);
    console.log("Contract deployed at address: "+ factory.options.address);
}
deploy().then(() => {
    console.log("Completed.");    
});