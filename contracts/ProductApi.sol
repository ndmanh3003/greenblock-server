// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ProductApi {
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
    // required
    Account business;
    Account inspector;
    string name;
    string variety;
    string location;
    uint256 plantAt;
    // updateable
    mapping(uint256 => Status) history;
    uint256 historyCount;
    Status harvest;
    Status export;
    string imgCert;
    // optional
    string desc;
  }
  address owner;

  Product[] public products;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  event ProductCreated(uint256 id);

  function createProduct(
    string memory _name,
    string memory _variety,
    string memory _location,
    string memory _businessName,
    string memory _businessId,
    string memory _inspectorName,
    string memory _inspectorId,
    string memory _desc
  ) public onlyOwner {
    Account memory business = Account(_businessId, _businessName);
    Account memory inspector = Account(_inspectorId, _inspectorName);

    Product storage product = products.push();

    // from input
    product.business = business;
    product.inspector = inspector;
    product.name = _name;
    product.variety = _variety;
    product.location = _location;
    product.plantAt = block.timestamp;
    product.desc = _desc;
    // others
    product.historyCount = 0;
    product.imgCert = '';
    product.harvest = Status(0, '', new string[](0));
    product.export = Status(0, '', new string[](0));

    // emit event
    uint256 id = products.length - 1;
    emit ProductCreated(id);
  }

  function handleStatus(uint256 _index, string memory _desc, string[] memory _img, uint256 _type) public onlyOwner {
    require(_type < 4, 'Invalid status type');
    require(_index < products.length, 'Invalid product index');

    Status memory status = Status(block.timestamp, _desc, _img);
    Product storage product = products[_index];

    // 0: history, 1: harvest, 2: export, 3: delete
    if (_type == 0) product.history[product.historyCount++] = status;
    else if (_type == 1) product.harvest = status;
    else if (_type == 2) product.export = status;
    else {
      require(product.historyCount > 0, 'No status to delete');

      uint256 time = block.timestamp - product.history[product.historyCount - 1].time;
      require(time < (2 * 24 * 60 * 60), 'We can only delete the latest status within 2 days');

      delete product.history[--product.historyCount];
    }
  }

  function getType(uint256 _index) public view returns (uint256) {
    // 0: planting, 1: harvested, 2: inspected, 3: exported
    require(_index < products.length, 'Invalid product index');

    Product storage product = products[_index];
    if (product.harvest.time == 0) return 0; // farmer
    if (product.export.time == 0 && keccak256(abi.encodePacked(product.imgCert)) == 0) return 1; // inspector
    if (product.export.time == 0) return 2; // processor
    return 3; // consumer
  }

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

    if (bytes(_name).length != 0) product.name = _name;
    if (bytes(_variety).length != 0) product.variety = _variety;
    if (bytes(_location).length != 0) product.location = _location;
    if (bytes(_desc).length != 0) product.desc = _desc;
    if (bytes(_imgCert).length != 0) product.imgCert = _imgCert;
  }

  function getProducts(
    string memory _accountId,
    uint256 _isBusiness,
    uint256 _isFarmer
  ) public view returns (uint256[] memory) {
    require(_isBusiness < 2, 'Invalid account type');

    uint256[] memory result = new uint256[](products.length);
    uint256 count = 0;

    if (_isBusiness == 1) {
      for (uint256 i = 0; i < products.length; i++) {
        if (keccak256(abi.encodePacked(products[i].business.id)) == keccak256(abi.encodePacked(_accountId))) {
          if ((_isFarmer == 1 && getType(i) != 0) || (_isFarmer == 0 && getType(i) != 2)) continue;
          result[count++] = i;
        }
      }
    } else {
      for (uint256 i = 0; i < products.length; i++) {
        if (
          getType(i) != 0 &&
          keccak256(abi.encodePacked(products[i].inspector.id)) == keccak256(abi.encodePacked(_accountId))
        ) result[count++] = i;
      }
    }

    uint256[] memory finalResult = new uint256[](count);
    for (uint256 i = 0; i < count; i++) finalResult[i] = result[i];

    return finalResult;
  }

  function getProduct(
    uint256 _index
  )
    public
    view
    returns (
      Account memory,
      Account memory,
      string memory,
      string memory,
      string memory,
      uint256,
      Status[] memory,
      uint256,
      Status memory,
      Status memory,
      string memory,
      string memory
    )
  {
    require(_index < products.length, 'Invalid product index');

    Product storage product = products[_index];

    uint256 count = product.historyCount;
    Status[] memory history = new Status[](count);
    for (uint256 i = 0; i < count; i++) history[i] = product.history[i];

    return (
      product.business,
      product.inspector,
      product.name,
      product.variety,
      product.location,
      product.plantAt,
      history,
      product.historyCount,
      product.harvest,
      product.export,
      product.imgCert,
      product.desc
    );
  }
}
