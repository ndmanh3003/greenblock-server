// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title ProductApi - A contract for managing product lifecycle in a supply chain
contract ProductApi {
  address public owner;

  // Struct definitions
  struct Account {
    string id;
    string name;
  }

  struct Status {
    uint256 time;
    string desc;
    string[] img;
  }

  struct Product {
    Account business;
    Account inspector;
    string name;
    string variety;
    string location;
    uint256 plantAt;
    mapping(uint256 => Status) history;
    uint256 historyCount;
    Status harvest;
    Status export;
    string imgCert;
    string desc;
  }

  struct ProductDetails {
    Account business;
    Account inspector;
    string name;
    string variety;
    string location;
    uint256 plantAt;
    Status[] history;
    uint256 historyCount;
    Status harvest;
    Status export;
    string imgCert;
    string desc;
    uint256 productType;
  }

  // Array to store all products
  Product[] public products;

  // Event declarations
  event ProductCreated(uint256 indexed id);
  event ProductUpdated(uint256 indexed id);
  event StatusAdded(uint256 indexed productId, uint256 statusType);

  // Constants for status types
  uint256 private constant STATUS_HISTORY = 0;
  uint256 private constant STATUS_HARVEST = 1;
  uint256 private constant STATUS_EXPORT = 2;
  uint256 private constant STATUS_DELETE = 3;

  // Constants for product types
  uint256 public constant TYPE_PLANTING = 0;
  uint256 public constant TYPE_HARVESTED = 1;
  uint256 public constant TYPE_INSPECTED = 2;
  uint256 public constant TYPE_EXPORTED = 3;

  // Constructor to set the contract owner
  constructor() {
    owner = msg.sender;
  }

  // Modifier to replace onlyOwner
  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the contract owner can call this function');
    _;
  }

  // Function to transfer ownership
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), 'New owner cannot be the zero address');
    owner = newOwner;
  }

  /// @notice Creates a new product
  /// @dev Only the contract owner can call this function
  /// @param _name Name of the product
  /// @param _variety Variety of the product
  /// @param _location Location of the product
  /// @param _businessName Name of the business
  /// @param _businessId ID of the business
  /// @param _inspectorName Name of the inspector
  /// @param _inspectorId ID of the inspector
  /// @param _desc Description of the product
  function createProduct(
    string memory _name,
    string memory _variety,
    string memory _location,
    string memory _businessId,
    string memory _businessName,
    string memory _inspectorId,
    string memory _inspectorName,
    string memory _desc
  ) public onlyOwner {
    // Create Account structs for business and inspector
    Account memory business = Account(_businessId, _businessName);
    Account memory inspector = Account(_inspectorId, _inspectorName);

    // Add new product to the products array
    Product storage product = products.push();

    // Initialize product fields
    product.business = business;
    product.inspector = inspector;
    product.name = _name;
    product.variety = _variety;
    product.location = _location;
    product.plantAt = block.timestamp;
    product.desc = _desc;
    product.historyCount = 0;
    product.imgCert = '';
    product.harvest = Status(0, '', new string[](0));
    product.export = Status(0, '', new string[](0));

    // Emit event for product creation
    uint256 id = products.length - 1;
    emit ProductCreated(id);
  }

  /// @notice Handles status updates for a product
  /// @dev Only the contract owner can call this function
  /// @param _index Index of the product in the products array
  /// @param _desc Description of the status update
  /// @param _img Array of image URLs associated with the status update
  /// @param _type Type of status update (history, harvest, export, or delete)
  function handleStatus(uint256 _index, string memory _desc, string[] memory _img, uint256 _type) public onlyOwner {
    require(_type <= STATUS_DELETE, 'Invalid status type');
    require(_index < products.length, 'Invalid product index');

    Product storage product = products[_index];

    if (_type == STATUS_DELETE) {
      require(product.historyCount > 0, 'No status to delete');
      uint256 time = block.timestamp - product.history[product.historyCount - 1].time;
      require(time < 2 days, 'We can only delete the latest status within 2 days');
      delete product.history[--product.historyCount];
    } else {
      Status memory status = Status(block.timestamp, _desc, _img);
      if (_type == STATUS_HISTORY) product.history[product.historyCount++] = status;
      else if (_type == STATUS_HARVEST) product.harvest = status;
      else if (_type == STATUS_EXPORT) product.export = status;
    }

    emit StatusAdded(_index, _type);
  }

  /// @notice Determines the current type/stage of a product
  /// @param _index Index of the product in the products array
  /// @return The type of the product (planting, harvested, inspected, or exported)
  function getType(uint256 _index) internal view returns (uint256) {
    require(_index < products.length, 'Invalid product index');

    Product storage product = products[_index];
    if (product.harvest.time == 0) return TYPE_PLANTING;
    if (bytes(product.imgCert).length == 0) return TYPE_HARVESTED;
    if (product.export.time == 0) return TYPE_INSPECTED;
    return TYPE_EXPORTED;
  }

  /// @notice Updates the details of an existing product
  /// @dev Only the contract owner can call this function
  /// @param _index Index of the product in the products array
  /// @param _name New name of the product (if not empty)
  /// @param _variety New variety of the product (if not empty)
  /// @param _location New location of the product (if not empty)
  /// @param _desc New description of the product (if not empty)
  /// @param _imgCert New image certification of the product (if not empty)
  function updateProduct(
    uint256 _index,
    string memory _name,
    string memory _variety,
    string memory _location,
    string memory _desc,
    string memory _imgCert
  ) public onlyOwner {
    require(_index < products.length, 'Invalid product index');

    Product storage product = products[_index];

    // Update fields only if new values are provided
    if (bytes(_name).length != 0) product.name = _name;
    if (bytes(_variety).length != 0) product.variety = _variety;
    if (bytes(_location).length != 0) product.location = _location;
    if (bytes(_desc).length != 0) product.desc = _desc;
    if (bytes(_imgCert).length != 0) product.imgCert = _imgCert;

    emit ProductUpdated(_index);
  }

  /// @notice Retrieves products associated with a specific account
  /// @param _accountId ID of the account (business or inspector)
  /// @param _isBusiness True if the account is a business, false if it's an inspector
  /// @param _isFarmer True if filtering for farmer products, false otherwise
  /// @return An array of product indices that match the criteria
  function getProducts(
    string memory _accountId,
    bool _isBusiness,
    uint8 _isFarmer
  ) public view returns (uint256[] memory) {
    uint256[] memory result = new uint256[](products.length);
    uint256 count = 0;

    for (uint256 i = 0; i < products.length; i++) {
      uint256 productType = getType(i);
      if (_isBusiness) {
        if (keccak256(abi.encodePacked(products[i].business.id)) == keccak256(abi.encodePacked(_accountId))) {
          if ((_isFarmer == 1 && productType != TYPE_PLANTING) || (_isFarmer == 0 && productType != TYPE_INSPECTED))
            continue;
          result[count++] = i;
        }
      } else {
        if (
          productType != TYPE_PLANTING &&
          keccak256(abi.encodePacked(products[i].inspector.id)) == keccak256(abi.encodePacked(_accountId))
        ) result[count++] = i;
      }
    }

    // Resize the array to fit the actual count
    assembly {
      mstore(result, count)
    }

    return result;
  }

  /// @notice Retrieves all details of a specific product
  /// @param _index Index of the product in the products array
  /// @return A tuple containing all details of the product, including its current type
  function getProduct(uint256 _index) public view returns (ProductDetails memory) {
    require(_index < products.length, 'Invalid product index');
    Product storage product = products[_index];

    // Create a memory array to store the product's history
    Status[] memory history = new Status[](product.historyCount);
    for (uint256 i = 0; i < product.historyCount; i++) history[i] = product.history[i];

    uint256 productType = getType(_index);

    ProductDetails memory details = ProductDetails({
      business: product.business,
      inspector: product.inspector,
      name: product.name,
      variety: product.variety,
      location: product.location,
      plantAt: product.plantAt,
      history: history,
      historyCount: product.historyCount,
      harvest: product.harvest,
      export: product.export,
      imgCert: product.imgCert,
      desc: product.desc,
      productType: productType
    });

    return details;
  }
}
