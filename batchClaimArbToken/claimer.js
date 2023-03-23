import { ethers } from "ethers";
import { erc20_abi, claim_abi } from "./abis.js";
import { Alchemy, Network } from "alchemy-sdk";
import chalk from "chalk";
let pasta = `arb tool`;
const settings = {
  apiKey:  process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API KEY.
                                   // (not https://... or ws://, just key)
  network: Network.ARB_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

let prv_key_array = [
    // your private keys here
    "0xf305e90be2216059a00f320aae60a3dd76ac49e176cfc73d0a53a48d8163eae3",
    "0x71c7442440e2b5cbdbd73e7260a287879510b53669d12b8f59940fb1e1b28379",
]
let destination_address_array = [
    // destination addresses here
    // please replace with your address
    // must be same length as private keys array
    process.env.SAFE_PRIVATE_KEY1,
    process.env.SAFE_PRIVATE_KEY2,
    process.env.SAFE_PRIVATE_KEY3,
    process.env.SAFE_PRIVATE_KEY4,
    process.env.SAFE_PRIVATE_KEY5,
    process.env.SAFE_PRIVATE_KEY6,
    process.env.SAFE_PRIVATE_KEY7,
    process.env.SAFE_PRIVATE_KEY8,
    process.env.SAFE_PRIVATE_KEY9,
    process.env.SAFE_PRIVATE_KEY10,
]
let rpc_array = [
    // any rpc you can find... (https://...)
    // can be even 1, but the more the better
    "https://arbitrum-mainnet.infura.io",
    "https://endpoints.omniatech.io/v1/arbitrum/one/public",
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum.blockpi.network/v1/rpc/public",
    "https://arbitrum-one.public.blastapi.io",
    "https://1rpc.io/arb",
    "https://rpc.ankr.com/arbitrum",
]


let amountToClaim = [];
let currentNonce = [];

let claimContract = new ethers.Contract("0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9", claim_abi);
let token = new ethers.Contract("0x912CE59144191C1204E64559FE8253a0e49E6548", erc20_abi);

async function prepareToClaim(rpc) {
    for (let i = 0; i < prv_key_array.length; i++) {
        let provider = new ethers.providers.JsonRpcProvider(rpc, 42161);
        let wallet = new ethers.Wallet(prv_key_array[i], provider);  

        let current_nonce = await provider.getTransactionCount(wallet.address);
        let claimableAmount = await claimContract.connect(wallet).claimableTokens(wallet.address);
        amountToClaim.push(claimableAmount);
        currentNonce.push(current_nonce);
        console.log("amount to claim", amountToClaim);
        console.log("currentNonce", currentNonce);
    }
}
async function sendClaimAndTransfer(rpc, prv_key, current_nonce, to_addr, claimableAmount) {
    let provider = new ethers.providers.JsonRpcProvider(rpc, 42161);
    let wallet = new ethers.Wallet(prv_key, provider);
    
    try {
        let claimTx = claimContract.connect(wallet).claim({
        gasLimit: "0x4C4B40",// 5kk in case gas on L1 is expensive.. Read about arbitrums 2D fees to learn more
        gasPrice: "0x3B9ACA00", // 1kkk = 1 gwei in case network is  overloaded
        // MAX GAS USED TO CLAIM = 0.005 eth ~= 9$
        nonce: current_nonce,
    })
    } catch(error) {
        console.log(chalk.red("error on claim occured"));
        console.log(chalk.red("wallet: ", wallet.address));
        console.log(error);
    }
    await new Promise(r => setTimeout(r, 30));
    try {
        let transferTx = token.connect(wallet).transferFrom(wallet.address, to_addr, claimableAmount, {
            gasLimit: "0x4C4B40",// 5kk in case gas on L1 is expensive.. Read about arbitrums 2D fees to learn more
            gasPrice: "0x3B9ACA00", // 1kkk = 1 gwei in case network is  overloaded
        // MAX GAS USED TO CLAIM = 0.005 eth ~= 9$
        nonce: current_nonce+1,
        });
    }  catch(error) {
        console.log(chalk.red("error on transfer occured.."));
        console.log(chalk.red("wallet: ", wallet.address));
        console.log(error);
    }
    
    
}
function sendMeMoneyBatch() {
    for (let i = 0; i < prv_key_array.length; i++) {
        sendClaimAndTransfer(rpc_array[i % rpc_array.length], prv_key_array[i], currentNonce[i], destination_address_array[i], amountToClaim[i]);
    }
}
function sendMeMoneyBitch() {
    for (let i = 0; i < prv_key_array.length; i++) {
        sendClaimAndTransfer(rpc_array[i % rpc_array.length], prv_key_array[i], currentNonce[i], destination_address_array[i], amountToClaim[i]);
    }
}
async function prepare() {
    for (let i = 0; i < prv_key_array.length; i++) {
        await prepareToClaim(rpc_array[0]);
    }
}
console.log(chalk.green(pasta));
await prepare();

alchemy.ws.on("block", 
async (blockNumber) => {
console.log(blockNumber);
if (blockNumber >= 16890400) { // 16890400
    await new Promise(r => setTimeout(r, 700));
    sendMeMoneyBatch();
    alchemy.ws.removeAllListeners();
}
})
