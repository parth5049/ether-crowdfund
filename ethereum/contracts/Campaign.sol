pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCamgpaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCamgpaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    
    modifier onlyManager {
        require(msg.sender == manager, "Only manager can call this function.");
        _;
    }
    
    constructor(uint minContribution, address sender) public {
        manager = sender;
        minimumContribution = minContribution;
    }
    
    function contribute() public payable {
        require(msg.value >= minimumContribution, "Minimum Contribution Required");
        
        if(!approvers[msg.sender]){
            approvers[msg.sender] = true;
            approversCount++;    
        }
    }
    
    function createRequest(string description, uint value, address recipient)  public onlyManager {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint reqIndex) public {
        Request storage request = requests[reqIndex];
        
        require(approvers[msg.sender], "You need to contribute first to become an approver.");
        require(!request.approvals[msg.sender], "You have already voted for this request");
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
        
    }
    
    function finalizeRequest(uint reqIndex) public onlyManager {
        Request storage request = requests[reqIndex];
        
        require(request.approvalCount > (approversCount / 2), "There are not enough approvals to process this request.");
        require(!request.complete,"The request is already finalized.");
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }
    
    
}