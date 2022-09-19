const { inputToConfig } = require("@ethereum-waffle/compiler");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC55501", function () {
  let erc5006;
  let signers;
  let zero_address = "0x0000000000000000000000000000000000000000";

  async function initialization(){
    await erc5006.connect(signers[0]).mintBatch(signers[0].address,[1,2,3,4,5],[5,5,5,5,5],0x00);
  }

  beforeEach(async()=>{
    signers = await ethers.getSigners();
    const ERC5006 = await ethers.getContractFactory("ERC5006");
    erc5006 = await ERC5006.connect(signers[0]).deploy("MyTokens",3);
    await erc5006.deployed();
  });

  describe("Functions",async()=>{
    describe("mint",async()=>{
      it("should mint tokens to owner",async()=>{
        await initialization();
        await expect(await erc5006.balanceOf(signers[0].address,1)).to.equal(5);
      });
    });

    describe("mintBatch",async()=>{
      it("should mint batch to owner",async()=>{
        await erc5006.connect(signers[0]).mint(signers[0].address,1,5,0x00);
        await expect(await erc5006.balanceOf(signers[0].address,1)).to.equal(5);
      });
    });

    describe("createUserRecord",async()=>{
      it("should mint batch to owner",async()=>{
        await initialization();
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,2,100);
        await expect(await erc5006.frozenBalanceOf(signers[0].address,3)).to.equal(2);
      });
    });

    describe("deleteUserRecord",async()=>{
      it("should delete created record",async()=>{
        await initialization();
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100);
        await erc5006.connect(signers[0]).deleteUserRecord(1);
        await expect(await erc5006.frozenBalanceOf(signers[0].address,3)).to.equal(0);
      });

    });
    describe("safeTransferFrom",async()=>{
      it("should transfer tokens",async()=>{
        await initialization();
        erc5006["safeTransferFrom(address,address,uint256,uint256,bytes)"](signers[0].address,signers[1].address,1,2,0x00);
        await expect(await erc5006.balanceOf(signers[1].address,1)).to.equal(2);
      });

    });
  });

  describe("Function reverts",async()=>{
    describe("createUserRecored",async()=>{
      it("Should not create more record than balance",async()=>{
        await initialization();
        await expect(erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,6,100)).to.be.revertedWith("ERC1155: insufficient balance for transfer");
      });
      it("Only token owner should be able to create user record",async()=>{
        await initialization();
        await expect(erc5006.connect(signers[1]).createUserRecord(signers[0].address,signers[1].address,3,1,100)).to.be.revertedWith("only owner or approved");
      });
      it("User can not be zero address",async()=>{
        await initialization();
        await expect(erc5006.connect(signers[0]).createUserRecord(signers[0].address,zero_address.toString(),3,1,100)).to.be.revertedWith("user cannot be the zero address");
      });
      it("Token amount must be greater than zero",async()=>{
        await initialization();
        await expect(erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address.toString(),3,0,100)).to.be.revertedWith("amount must be greater than 0");
      });
      it("Expiry time must be greater than current time",async()=>{
        await initialization();
        await expect(erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address.toString(),3,1,0)).to.be.revertedWith("expiry must after the block timestamp");
      });
      it("Should not create more record than limit",async()=>{
        await initialization();
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100);
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100);
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100);
        await expect(erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100)).to.be.revertedWith("user cannot have more records");
      });
    });
    describe("deleteUserRecord",async()=>{
      it("Only owner should be able to delete the record",async()=>{
        await initialization();
        await erc5006.connect(signers[0]).createUserRecord(signers[0].address,signers[1].address,3,1,100);
        await expect( erc5006.connect(signers[1]).deleteUserRecord(1)).to.be.revertedWith("only owner or approved");
      });
    });
  })
    
});
