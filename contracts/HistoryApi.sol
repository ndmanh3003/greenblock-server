// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title HistoryApi
 * @dev A contract for managing product history records with status updates
 */
contract HistoryApi {
  address public owner;

  struct Status {
    uint256 time;
    string desc;
    string[] img;
  }

  struct Record {
    bool isHarvested;
    mapping(uint256 => Status) statuses;
    uint256 statusCount;
  }

  Record[] public records;
  uint256 private constant MAX_STATUS_AGE = 1 days;
  event RecordCreated(uint256 indexed id);

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the contract owner can call this function');
    _;
  }

  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Can only be called by the current owner.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), 'New owner cannot be the zero address');
    owner = newOwner;
  }

  /**
   * @dev Creates a new record
   */
  function createRecord() public onlyOwner {
    Record storage newRecord = records.push();
    newRecord.isHarvested = false;
    newRecord.statusCount = 0;
    emit RecordCreated(records.length - 1);
  }

  /**
   * @dev Adds a new status to a history record
   * @param recordId The ID of the record to update
   * @param desc The description of the new status
   * @param img An array of image URLs associated with the status
   * @param isHarvested Whether the product is harvested with this status update
   */
  function addStatus(uint256 recordId, string memory desc, string[] memory img, bool isHarvested) public onlyOwner {
    require(recordId < records.length, 'Record does not exist');
    Record storage record = records[recordId];
    require(!record.isHarvested, 'Product is already harvested');

    if (isHarvested) record.isHarvested = true;

    Status memory newStatus = Status({ time: block.timestamp, desc: desc, img: img });
    record.statuses[record.statusCount++] = newStatus;
  }

  /**
   * @dev Removes the latest status from a history record
   * @param recordId The ID of the record to update
   */
  function removeLatestStatus(uint256 recordId) public onlyOwner {
    require(recordId < records.length, 'Record does not exist');
    Record storage record = records[recordId];
    require(record.statusCount > 0, 'No status to remove');

    uint256 latestStatusIndex = record.statusCount - 1;
    Status storage latestStatus = record.statuses[latestStatusIndex];

    require(block.timestamp - latestStatus.time <= MAX_STATUS_AGE, 'Cannot remove status older than 24 hours');

    if (record.isHarvested) record.isHarvested = false;

    delete record.statuses[latestStatusIndex];
    record.statusCount--;
  }

  /**
   * @dev Retrieves all statuses of a history record
   * @param recordId The ID of the record to query
   * @return _statuses An array of Status structs
   * @return isHarvested Whether the product is harvested
   * @return statusCount The number of statuses in the record
   */
  function getRecord(
    uint256 recordId
  ) public view returns (Status[] memory _statuses, bool isHarvested, uint256 statusCount) {
    require(recordId < records.length, 'Record does not exist');
    Record storage record = records[recordId];

    Status[] memory statuses = new Status[](record.statusCount);
    for (uint256 i = 0; i < record.statusCount; i++) statuses[i] = record.statuses[i];

    return (statuses, record.isHarvested, record.statusCount);
  }
}
