// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts@4.8.2/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.2/access/Ownable.sol";
import "@openzeppelin/contracts@4.8.2/utils/Strings.sol";
import "@openzeppelin/contracts@4.8.2/security/ReentrancyGuard.sol";

contract GanGamEvolution is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 7687; // Nombre total de tokens disponibles
    uint256 public constant MAX_MINT_PER_WALLET = 500; // Limite de 20 tokens par wallet
    uint256 public constant MAX_MINT_PER_TRANSACTION = 50; // Limite de 10 tokens par transaction
    uint256 public tokenPrice; // Prix d'un token
    bool public saleIsActive = false; // Statut de la vente
    bool public limitMintPerWallet = true; // Activer/désactiver la limite par wallet
    string private _baseTokenURI; // URI de base pour les métadonnées des tokens
    uint256 private _totalMinted; // Nombre total de tokens mintés
    address public stakingContract; // Adresse du contrat de staking

    mapping(address => uint256) private _mintedPerWallet; // Nombre de tokens mintés par wallet
    mapping(uint256 => uint256) private _tokenPrices; // Prix de chaque token
    mapping(uint256 => address[]) private _ownershipHistory; // Historique des propriétaires de chaque token
    mapping(uint256 => bool) private _isStaked; // Statut de staking de chaque token

    event Minted(address indexed minter, uint256 tokenId, uint256 price);
    event SaleStatusChanged(bool newStatus);
    event PriceUpdated(uint256 newPrice);
    event LimitMintPerWalletChanged(bool newStatus);
    event TokenPriceUpdated(uint256 tokenId, uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event Withdrawn(address indexed recipient, uint256 amount);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event Staked(uint256 indexed tokenId, address indexed owner);
    event Unstaked(uint256 indexed tokenId, address indexed owner);
    event StakingContractUpdated(address indexed newStakingContract);

    modifier onlyStakingContract() {
        require(msg.sender == stakingContract, "Not authorized");
        _;
    }

    constructor(
        string memory baseTokenURI,
        uint256 initialTokenPrice
    ) ERC721("Gang Game Evolution", "GGE") {
        _baseTokenURI = baseTokenURI;
        tokenPrice = initialTokenPrice;
    }

    // Fonction pour mint plusieurs tokens
    function mint(uint256 quantity) public payable nonReentrant {
        require(saleIsActive, "Sale inactive");
        require(_totalMinted + quantity <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= tokenPrice * quantity, "Insufficient payment");
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= MAX_MINT_PER_TRANSACTION, "Exceeds max mint per transaction");

        if (limitMintPerWallet) {
            require(_mintedPerWallet[msg.sender] + quantity <= MAX_MINT_PER_WALLET, "Exceeds max mint per wallet");
        }

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _totalMinted + 1;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId, msg.value / quantity);

            unchecked {
                _totalMinted++;
            }

            _mintedPerWallet[msg.sender]++;
            _tokenPrices[tokenId] = msg.value / quantity;
            _ownershipHistory[tokenId].push(msg.sender);
        }
    }

    // Fonction pour définir l'adresse du contrat de staking
    function setStakingContract(address newStakingContract) external onlyOwner {
        require(newStakingContract != address(0), "Invalid address");
        stakingContract = newStakingContract;
        emit StakingContractUpdated(newStakingContract);
    }

    // Fonction pour staker un token (appelée par le contrat de staking)
    function stake(uint256 tokenId) external onlyStakingContract {
        require(!_isStaked[tokenId], "Already staked");
        _isStaked[tokenId] = true;
        emit Staked(tokenId, ownerOf(tokenId));
    }

    // Fonction pour unstaker un token (appelée par le contrat de staking)
    function unstake(uint256 tokenId) external onlyStakingContract {
        require(_isStaked[tokenId], "Not staked");
        _isStaked[tokenId] = false;
        emit Unstaked(tokenId, ownerOf(tokenId));
    }

    // Fonction pour vérifier si un token est staké
    function isStaked(uint256 tokenId) external view returns (bool) {
        return _isStaked[tokenId];
    }

    // Fonction pour définir l'URI de base des tokens
    function setBaseTokenURI(string memory newBaseTokenURI) public onlyOwner {
        require(bytes(newBaseTokenURI).length > 0, "Invalid base URI");
        _baseTokenURI = newBaseTokenURI;
        emit BaseURIUpdated(newBaseTokenURI);
    }

    // Fonction pour définir le prix d'un token
    function setTokenPrice(uint256 newTokenPrice) public onlyOwner {
        require(newTokenPrice > 0, "Price must be greater than 0");
        tokenPrice = newTokenPrice;
        emit PriceUpdated(newTokenPrice);
    }

    // Fonction pour mettre à jour le prix d'un token spécifique
    function updateTokenPrice(uint256 tokenId, uint256 newPrice) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(newPrice > 0, "Price must be greater than 0");
        _tokenPrices[tokenId] = newPrice;
        emit TokenPriceUpdated(tokenId, newPrice);
    }

    // Fonction pour activer/désactiver la vente
    function setSaleIsActive(bool isActive) public onlyOwner {
        saleIsActive = isActive;
        emit SaleStatusChanged(isActive);
    }

    // Fonction pour activer/désactiver la limite de mint par wallet
    function setLimitMintPerWallet(bool isActive) public onlyOwner {
        limitMintPerWallet = isActive;
        emit LimitMintPerWalletChanged(isActive);
    }

    // Fonction pour retirer les fonds du contrat
    function withdrawAll() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
        emit Withdrawn(owner(), balance);
    }

    // Fonction pour retirer une quantité spécifique de fonds vers une adresse
    function withdrawTo(address payable recipient, uint256 amount) public onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawn(recipient, amount);
    }

    // Fonction pour obtenir le prix d'un token spécifique
    function getTokenPrice(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenPrices[tokenId];
    }

    // Fonction pour obtenir le nombre total de tokens mintés
    function totalSupply() public view returns (uint256) {
        return _totalMinted;
    }

    // Fonction pour obtenir l'URI d'un token
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // Fonction pour vérifier si un wallet a minté des tokens
    function hasMinted(address wallet) public view returns (bool) {
        return _mintedPerWallet[wallet] > 0;
    }

    // Fonction pour obtenir l'historique des propriétaires d'un token
    function getOwnershipHistory(uint256 tokenId) public view returns (address[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return _ownershipHistory[tokenId];
    }

    // Fonction pour vérifier si un wallet a déjà possédé un token spécifique
    function hasOwnedToken(address wallet, uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        for (uint256 i = 0; i < _ownershipHistory[tokenId].length; i++) {
            if (_ownershipHistory[tokenId][i] == wallet) {
                return true;
            }
        }
        return false;
    }
}