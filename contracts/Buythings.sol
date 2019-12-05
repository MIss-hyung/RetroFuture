pragma solidity ^0.5.0;

contract Buythings {
  // 매입자의 정보를 struct로 저장하고 나중에 한꺼번에 가져올 것이다.
   struct Buyer {
       address buyerAddress;
       bytes32 nic;
   }

   mapping(uint => Buyer) public buyerInfo;
   //address public owner; 
   //.0.5.0버전부터는 밑처럼 변
   address Payable Public owner;
   address[10] public buyers;
   //상태변수로 고정타입의 배열 선언.0.5.0버전 부터는 밑처럼 변경
   //address payable[10] public buyers;

//소유자 설정
   constructor() public {
       //메세지 샌더가 owner
       owner = msg.sender;
   }

   //event
    event LogBuythings(
        address _buyer,
        uint _id
    );

   //매물의 아이디, 메물의 이름, 매입자 나이 세 개를 받는다
   // 고정사이즈 타입
   // 가시성, 타입제어자
   // payable 이더를 받아야 할 때 쓴다.
   // 매입자가 매입했을 때 메타마스크가 뜨고 매입가를(이더) 이 함수로 보내는 것이다.
   function buythings(uint _id) public payable {
       buyers[_id] = msg.sender;	// 매물을 사려고 하는 사람을 입력한다. msg.sender는 함수를 사용하고 있는 계정,
                     // 매개변수로 받은 아이디를 이용해서 저장을 할 것이다.
       buyerInfo[_id] = Buyer(msg.sender);

       owner.transfer(msg.value); //이더를 계정에서 계정으로 이동할 때 transfer를 사용한다. msg.value는 wei 만 허용한다.
       emit LogBuythings(msg.sender, _id);
   }

   function getBuyerInfo(uint _id) public view returns (address, bytes32) {
       //리턴타입 명시는 buyerInfo와 맞춰준 것
       //매개변수로 받은 매물의 Id를 사용해서 buyerInfo의 키값으로쓰고 해당 값을 가져오자.

       Buyer memory buyer =  buyerInfo[_id];
       //매개변수 _id를 넘겨서 키값으로 쓰고 해당 buyer를 가져와서 변수에 저장
       //memory 함수가 끝나면 휘발한다.

       //변수 안에 있는 필드들을 리턴하면 된다.
       return (buyer.buyerAddress, buyer.nic);
   }

   // 매입자들의 계정 주소를 저장하는 buyers 배열을 리턴하는 함수
   function getAllBuyers() public view returns(address[10] memory) {
       return buyers;
   }
}
