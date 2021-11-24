pragma solidity ^0.5.0;

contract Decentragram {
  string public name = "Decentragram";
  // store images
  uint public imageCount = 0;
  mapping(uint => Image) public images;
  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }
  // create images
  function uploadImage(string memory _imgHash, string memory _description) public {
    // increment image id
    imageCount++;
    // add image to contract
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);
  }


  // tip images
}
