const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    await factory.methods.createCampaign('100').send({ from: accounts[0], gas: '1000000' });

    const addresses = await factory.methods.getDeployedCampaigns().call({ from: accounts[0] });
    campaignAddress = addresses[0];

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );

});

describe('Campaign', () => {
    it('deploys factory and campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('contributes and makes approvers', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '10000'
        });

        const isApprover = await campaign.methods.approvers(accounts[1]).call();

        assert.equal(true, isApprover);
    });

    it('verifies minimum contribution', async () => {
        try{
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: '99'
            });
            assert(false);
        }catch(err){
            assert(err);
        }
        
    });

    it('allows manager to make a payment request', async () => {
        await campaign.methods.createRequest('Creating test request', '10000', accounts[2])
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        const request = await campaign.methods.requests(0).call();

        assert.equal('Creating test request',request.description);
    });

    it('processes the requests', async () => {
        
        
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10','ether')
        });

        await campaign.methods
            .createRequest('Creating test request', web3.utils.toWei('2','ether'), accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance);
        assert(balance > 101);
    });
});