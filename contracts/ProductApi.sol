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

  event ProductCreated(uint256 productId);

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

    Product storage newProduct = products.push();

    // from input
    newProduct.business = business;
    newProduct.inspector = inspector;
    newProduct.name = _name;
    newProduct.variety = _variety;
    newProduct.location = _location;
    newProduct.plantAt = block.timestamp;
    newProduct.desc = _desc;
    // others
    newProduct.historyCount = 0;
    newProduct.imgCert = '';
    newProduct.harvest = Status(0, '', new string[](0));
    newProduct.export = Status(0, '', new string[](0));

    // emit event
    uint256 lastProductId = products.length - 1;
    emit ProductCreated(lastProductId);
  }

  function handleStatus(uint256 _index, string memory _desc, string[] memory _img, uint256 _type) public onlyOwner {
    require(_type < 4, 'Invalid status type');
    require(_index < products.length, 'Invalid product index');

    Status memory status = Status(block.timestamp, _desc, _img);
    Product storage productSelected = products[_index];

    // 0: history, 1: harvest, 2: export, 3: delete
    if (_type == 0) productSelected.history[productSelected.historyCount++] = status;
    else if (_type == 1) productSelected.harvest = status;
    else if (_type == 2) productSelected.export = status;
    else {
      require(productSelected.historyCount > 0, 'No status to delete');

      uint256 time = block.timestamp - productSelected.history[productSelected.historyCount - 1].time;

      require(time < (2 * 24 * 60 * 60), 'We can only delete the latest status within 2 days');
      delete productSelected.history[--productSelected.historyCount];
    }
  }

  function updateProduct(
    uint256 _index,
    string memory _name,
    string memory _variety,
    string memory _location,
    string memory _inspectorName,
    string memory _inspectorId,
    string memory _desc,
    string memory _imgCert
  ) public onlyOwner {
    require(_index < products.length, 'Invalid product index');

    if (bytes(_name).length != 0) products[_index].name = _name;
    if (bytes(_variety).length != 0) products[_index].variety = _variety;
    if (bytes(_location).length != 0) products[_index].location = _location;
    if (bytes(_inspectorName).length != 0 && bytes(_inspectorId).length != 0)
      products[_index].inspector = Account(_inspectorId, _inspectorName);
    if (bytes(_desc).length != 0) products[_index].desc = _desc;
    if (bytes(_imgCert).length != 0) products[_index].imgCert = _imgCert;
  }

  function getProducts(string memory _accountId, uint256 _role) public view returns (uint256[] memory) {
    require(_role < 2, 'Invalid account type');

    uint256[] memory result = new uint256[](products.length);
    uint256 count = 0;

    // 0: business, 1: inspector
    if (_role == 0) {
      for (uint256 i = 0; i < products.length; i++) {
        if (keccak256(abi.encodePacked(products[i].business.id)) == keccak256(abi.encodePacked(_accountId)))
          result[count++] = i;
      }
    } else {
      for (uint256 i = 0; i < products.length; i++) {
        if (keccak256(abi.encodePacked(products[i].inspector.id)) == keccak256(abi.encodePacked(_accountId)))
          result[count++] = i;
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

    Product storage productSelected = products[_index];

    uint256 count = productSelected.historyCount;
    Status[] memory getHistory = new Status[](count);
    for (uint256 i = 0; i < count; i++) getHistory[i] = productSelected.history[i];

    return (
      productSelected.business,
      productSelected.inspector,
      productSelected.name,
      productSelected.variety,
      productSelected.location,
      productSelected.plantAt,
      getHistory,
      productSelected.historyCount,
      productSelected.harvest,
      productSelected.export,
      productSelected.imgCert,
      productSelected.desc
    );
  }
}
