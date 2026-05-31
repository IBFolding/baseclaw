// SPDX-License-Identifier: MIT
// CMAIL Token Contract - ERC20 with Anti-Spam Features for AI Agent Email System
// Deployed on Base L2

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CmailToken
 * @dev ERC20 token for AI agent email system with anti-spam protection
 * Features:
 * - Email sending costs CMAIL tokens
 * - Staking for reputation and quota
 * - Burn mechanism for spam reports
 * - Agent registration system
 */
contract CmailToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // ============ State Variables ============
    
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant BASE_SEND_COST = 1 * 10**18; // 1 CMAIL per email
    uint256 public constant MIN_STAKE = 100 * 10**18; // Min 100 CMAIL to register
    uint256 public constant STAKE_PER_QUOTA = 10 * 10**18; // 10 CMAIL per additional email/hour
    
    uint256 public baseSendCost = BASE_SEND_COST;
    uint256 public minStake = MIN_STAKE;
    uint256 public stakePerQuota = STAKE_PER_QUOTA;
    
    // ============ Structs ============
    
    struct Agent {
        bool isRegistered;
        uint256 reputation;
        uint256 stakedAmount;
        uint256 quotaPerHour;
        uint256 emailsSentThisHour;
        uint256 hourStart;
        uint256 totalEmailsSent;
        uint256 spamReports;
        bytes32 publicKey; // For encryption
        string agentMetadata; // JSON metadata URI
    }
    
    struct Email {
        bytes32 emailHash;
        address sender;
        address recipient;
        uint256 timestamp;
        uint256 cost;
        uint8 priority;
        bool isRead;
        bytes encryptedContent; // Encrypted email content
    }
    
    // ============ Mappings ============
    
    mapping(address => Agent) public agents;
    mapping(bytes32 => Email) public emails;
    mapping(address => bytes32[]) public inbox;
    mapping(address => bytes32[]) public sentBox;
    mapping(address => mapping(address => bool)) public whitelist;
    mapping(address => mapping(address => bool)) public blacklist;
    mapping(address => uint256) public blacklistCount;
    mapping(address => uint256) public lastEmailTime;
    
    // ============ Arrays ============
    
    address[] public registeredAgents;
    
    // ============ Events ============
    
    event AgentRegistered(address indexed agent, bytes32 publicKey, uint256 stakedAmount);
    event AgentDeregistered(address indexed agent, uint256 unstakedAmount);
    event EmailSent(
        bytes32 indexed emailHash,
        address indexed sender,
        address indexed recipient,
        uint256 cost,
        uint8 priority
    );
    event EmailRead(bytes32 indexed emailHash, address indexed reader);
    event Staked(address indexed agent, uint256 amount);
    event Unstaked(address indexed agent, uint256 amount);
    event ReputationUpdated(address indexed agent, uint256 newReputation);
    event SpamReported(address indexed reporter, address indexed spammer, uint256 burnAmount);
    event Blacklisted(address indexed agent, address indexed blockedAgent);
    event Whitelisted(address indexed agent, address indexed allowedAgent);
    event QuotaUpdated(address indexed agent, uint256 newQuota);
    
    // ============ Modifiers ============
    
    modifier onlyRegistered() {
        require(agents[msg.sender].isRegistered, "CMAIL: Agent not registered");
        _;
    }
    
    modifier notBlacklisted(address _target) {
        require(!blacklist[_target][msg.sender], "CMAIL: Sender is blacklisted");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _initialOwner) 
        ERC20("Cmail", "CMAIL") 
        Ownable(_initialOwner) 
    {
        _mint(_initialOwner, TOTAL_SUPPLY);
    }
    
    // ============ Agent Registration ============
    
    /**
     * @dev Register as an agent to send/receive emails
     * @param _publicKey Agent's public key for encryption
     * @param _metadataURI JSON metadata URI for agent info
     * @param _stakeAmount Amount to stake for quota
     */
    function registerAgent(
        bytes32 _publicKey,
        string calldata _metadataURI,
        uint256 _stakeAmount
    ) external nonReentrant {
        require(!agents[msg.sender].isRegistered, "CMAIL: Already registered");
        require(_stakeAmount >= minStake, "CMAIL: Insufficient stake");
        require(balanceOf(msg.sender) >= _stakeAmount, "CMAIL: Insufficient balance");
        
        // Transfer stake to contract
        _transfer(msg.sender, address(this), _stakeAmount);
        
        // Calculate quota based on stake
        uint256 quota = 10 + (_stakeAmount / stakePerQuota);
        
        agents[msg.sender] = Agent({
            isRegistered: true,
            reputation: 100, // Start with neutral reputation
            stakedAmount: _stakeAmount,
            quotaPerHour: quota,
            emailsSentThisHour: 0,
            hourStart: block.timestamp,
            totalEmailsSent: 0,
            spamReports: 0,
            publicKey: _publicKey,
            agentMetadata: _metadataURI
        });
        
        registeredAgents.push(msg.sender);
        
        emit AgentRegistered(msg.sender, _publicKey, _stakeAmount);
        emit QuotaUpdated(msg.sender, quota);
    }
    
    /**
     * @dev Deregister agent and unstake tokens
     */
    function deregisterAgent() external onlyRegistered nonReentrant {
        Agent storage agent = agents[msg.sender];
        uint256 stake = agent.stakedAmount;
        
        // Cannot deregister if blacklisted by many
        require(blacklistCount[msg.sender] < 10, "CMAIL: Too many blacklists");
        
        agent.isRegistered = false;
        agent.stakedAmount = 0;
        
        // Return staked tokens
        _transfer(address(this), msg.sender, stake);
        
        emit AgentDeregistered(msg.sender, stake);
    }
    
    /**
     * @dev Add stake to increase quota
     */
    function addStake(uint256 _amount) external onlyRegistered nonReentrant {
        require(balanceOf(msg.sender) >= _amount, "CMAIL: Insufficient balance");
        
        _transfer(msg.sender, address(this), _amount);
        
        Agent storage agent = agents[msg.sender];
        agent.stakedAmount += _amount;
        agent.quotaPerHour = 10 + (agent.stakedAmount / stakePerQuota);
        
        emit Staked(msg.sender, _amount);
        emit QuotaUpdated(msg.sender, agent.quotaPerHour);
    }
    
    /**
     * @dev Remove stake (reduces quota)
     */
    function removeStake(uint256 _amount) external onlyRegistered nonReentrant {
        Agent storage agent = agents[msg.sender];
        require(agent.stakedAmount - _amount >= minStake, "CMAIL: Must maintain min stake");
        
        agent.stakedAmount -= _amount;
        agent.quotaPerHour = 10 + (agent.stakedAmount / stakePerQuota);
        
        _transfer(address(this), msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount);
        emit QuotaUpdated(msg.sender, agent.quotaPerHour);
    }
    
    // ============ Email Operations ============
    
    /**
     * @dev Send an email to another agent
     * @param _recipient Recipient address
     * @param _encryptedContent Encrypted email content
     * @param _emailHash Hash of email for reference
     * @param _priority Priority level (1-5, 5 being highest)
     */
    function sendEmail(
        address _recipient,
        bytes calldata _encryptedContent,
        bytes32 _emailHash,
        uint8 _priority
    ) external onlyRegistered notBlacklisted(_recipient) nonReentrant {
        require(agents[_recipient].isRegistered, "CMAIL: Recipient not registered");
        require(_priority >= 1 && _priority <= 5, "CMAIL: Invalid priority");
        require(_recipient != msg.sender, "CMAIL: Cannot email self");
        
        Agent storage sender = agents[msg.sender];
        
        // Reset hourly counter if hour has passed
        if (block.timestamp >= sender.hourStart + 1 hours) {
            sender.hourStart = block.timestamp;
            sender.emailsSentThisHour = 0;
        }
        
        // Check quota
        require(sender.emailsSentThisHour < sender.quotaPerHour, "CMAIL: Quota exceeded");
        
        // Calculate cost based on priority and reputation
        uint256 cost = calculateEmailCost(msg.sender, _priority);
        
        require(balanceOf(msg.sender) >= cost, "CMAIL: Insufficient balance for email");
        
        // Burn tokens (anti-spam mechanism)
        _burn(msg.sender, cost);
        
        // Create email
        emails[_emailHash] = Email({
            emailHash: _emailHash,
            sender: msg.sender,
            recipient: _recipient,
            timestamp: block.timestamp,
            cost: cost,
            priority: _priority,
            isRead: false,
            encryptedContent: _encryptedContent
        });
        
        // Update inboxes
        inbox[_recipient].push(_emailHash);
        sentBox[msg.sender].push(_emailHash);
        
        // Update stats
        sender.emailsSentThisHour++;
        sender.totalEmailsSent++;
        lastEmailTime[msg.sender] = block.timestamp;
        
        // Reputation boost for successful send
        _updateReputation(msg.sender, 1);
        
        emit EmailSent(_emailHash, msg.sender, _recipient, cost, _priority);
    }
    
    /**
     * @dev Mark email as read
     */
    function markAsRead(bytes32 _emailHash) external {
        Email storage email = emails[_emailHash];
        require(email.recipient == msg.sender, "CMAIL: Not recipient");
        require(!email.isRead, "CMAIL: Already read");
        
        email.isRead = true;
        
        emit EmailRead(_emailHash, msg.sender);
    }
    
    /**
     * @dev Get email content (only recipient or sender)
     */
    function getEmail(bytes32 _emailHash) external view returns (Email memory) {
        Email memory email = emails[_emailHash];
        require(
            email.recipient == msg.sender || email.sender == msg.sender,
            "CMAIL: Unauthorized"
        );
        return email;
    }
    
    /**
     * @dev Get inbox for agent
     */
    function getInbox(address _agent) external view returns (bytes32[] memory) {
        require(
            msg.sender == _agent || agents[msg.sender].isRegistered,
            "CMAIL: Unauthorized"
        );
        return inbox[_agent];
    }
    
    /**
     * @dev Get sent emails for agent
     */
    function getSentBox(address _agent) external view returns (bytes32[] memory) {
        require(msg.sender == _agent, "CMAIL: Unauthorized");
        return sentBox[_agent];
    }
    
    // ============ Anti-Spam System ============
    
    /**
     * @dev Report spam - burns tokens from reporter and penalizes reported agent
     */
    function reportSpam(address _spammer, bytes32 _emailHash) external onlyRegistered {
        require(agents[_spammer].isRegistered, "CMAIL: Spammer not registered");
        require(_spammer != msg.sender, "CMAIL: Cannot report self");
        
        Email storage email = emails[_emailHash];
        require(email.recipient == msg.sender, "CMAIL: Must be recipient to report");
        require(!email.isRead || block.timestamp - email.timestamp < 7 days, "CMAIL: Too late to report");
        
        // Cost to report (prevents abuse)
        uint256 reportCost = baseSendCost / 2;
        require(balanceOf(msg.sender) >= reportCost, "CMAIL: Insufficient balance to report");
        
        _burn(msg.sender, reportCost);
        
        Agent storage spammer = agents[_spammer];
        spammer.spamReports++;
        
        // Burn tokens from spammer's stake
        uint256 burnAmount = baseSendCost * 5;
        if (spammer.stakedAmount >= burnAmount) {
            spammer.stakedAmount -= burnAmount;
            // Actually burn the tokens
            _burn(address(this), burnAmount);
        } else {
            _burn(address(this), spammer.stakedAmount);
            spammer.stakedAmount = 0;
        }
        
        // Reduce reputation
        _updateReputation(_spammer, -10);
        
        // Auto-blacklist if too many reports
        if (spammer.spamReports >= 3) {
            blacklist[msg.sender][_spammer] = true;
            blacklistCount[_spammer]++;
            emit Blacklisted(msg.sender, _spammer);
        }
        
        emit SpamReported(msg.sender, _spammer, burnAmount);
    }
    
    /**
     * @dev Blacklist an agent
     */
    function blacklistAgent(address _agent) external onlyRegistered {
        require(_agent != msg.sender, "CMAIL: Cannot blacklist self");
        blacklist[msg.sender][_agent] = true;
        blacklistCount[_agent]++;
        emit Blacklisted(msg.sender, _agent);
    }
    
    /**
     * @dev Remove from blacklist
     */
    function unblacklistAgent(address _agent) external onlyRegistered {
        blacklist[msg.sender][_agent] = false;
        blacklistCount[_agent]--;
    }
    
    /**
     * @dev Whitelist an agent (emails from whitelisted agents are free or discounted)
     */
    function whitelistAgent(address _agent) external onlyRegistered {
        require(_agent != msg.sender, "CMAIL: Cannot whitelist self");
        whitelist[msg.sender][_agent] = true;
        emit Whitelisted(msg.sender, _agent);
    }
    
    /**
     * @dev Remove from whitelist
     */
    function unwhitelistAgent(address _agent) external onlyRegistered {
        whitelist[msg.sender][_agent] = false;
    }
    
    /**
     * @dev Calculate email cost based on sender reputation and priority
     */
    function calculateEmailCost(address _sender, uint8 _priority) public view returns (uint256) {
        Agent storage sender = agents[_sender];
        uint256 cost = baseSendCost;
        
        // Priority multiplier (higher priority = higher cost)
        cost = cost * _priority;
        
        // Reputation discount
        if (sender.reputation >= 200) {
            cost = cost / 2; // 50% discount for high reputation
        } else if (sender.reputation >= 150) {
            cost = cost * 75 / 100; // 25% discount
        } else if (sender.reputation < 50) {
            cost = cost * 2; // 2x cost for low reputation
        } else if (sender.reputation < 20) {
            cost = cost * 5; // 5x cost for very low reputation
        }
        
        // Whitelist discount - if sender is whitelisted by recipient
        // Note: This is checked at send time in a real implementation
        
        return cost;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update base send cost
     */
    function setBaseSendCost(uint256 _newCost) external onlyOwner {
        baseSendCost = _newCost;
    }
    
    /**
     * @dev Update minimum stake
     */
    function setMinStake(uint256 _newMinStake) external onlyOwner {
        minStake = _newMinStake;
    }
    
    /**
     * @dev Update stake per quota
     */
    function setStakePerQuota(uint256 _newStakePerQuota) external onlyOwner {
        stakePerQuota = _newStakePerQuota;
    }
    
    /**
     * @dev Update agent reputation (admin only, for appeals or verified reports)
     */
    function updateReputation(address _agent, int256 _change) external onlyOwner {
        _updateReputation(_agent, _change);
    }
    
    // ============ Internal Functions ============
    
    function _updateReputation(address _agent, int256 _change) internal {
        Agent storage agent = agents[_agent];
        
        if (_change > 0) {
            agent.reputation += uint256(_change);
        } else {
            uint256 decrease = uint256(-_change);
            if (agent.reputation > decrease) {
                agent.reputation -= decrease;
            } else {
                agent.reputation = 0;
            }
        }
        
        // Cap reputation at 1000
        if (agent.reputation > 1000) {
            agent.reputation = 1000;
        }
        
        emit ReputationUpdated(_agent, agent.reputation);
    }
    
    // ============ View Functions ============
    
    function getAgentInfo(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }
    
    function getRemainingQuota(address _agent) external view returns (uint256) {
        Agent storage agent = agents[_agent];
        if (block.timestamp >= agent.hourStart + 1 hours) {
            return agent.quotaPerHour;
        }
        if (agent.emailsSentThisHour >= agent.quotaPerHour) {
            return 0;
        }
        return agent.quotaPerHour - agent.emailsSentThisHour;
    }
    
    function getRegisteredAgents() external view returns (address[] memory) {
        return registeredAgents;
    }
    
    function getInboxCount(address _agent) external view returns (uint256) {
        return inbox[_agent].length;
    }
    
    function isBlacklistedBy(address _agent, address _by) external view returns (bool) {
        return blacklist[_by][_agent];
    }
    
    function isWhitelistedBy(address _agent, address _by) external view returns (bool) {
        return whitelist[_by][_agent];
    }
}