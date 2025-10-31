import os, json
from decimal import Decimal
from typing import Optional

from web3 import Web3
from web3.contract import Contract
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
VRF_COORDINATOR = os.getenv("VRF_COORDINATOR")

ARTIFACT_RACE = os.getenv("ARTIFACT_RACE")
ARTIFACT_MOCK = os.getenv("ARTIFACT_MOCK")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

class Signer:
    def __init__(self, address: str, private_key: str):
        self.address = address
        self.private_key = private_key

def load_signer():
    if not PRIVATE_KEY:
        raise RuntimeError("PRIVATE_KEY missing in .env")
    acct = Account.from_key(PRIVATE_KEY)
    return Signer(address=acct.address, private_key=PRIVATE_KEY)

def load_abi_and_bytecode(artifact_path: str):
    with open(artifact_path, "r") as f:
        artifact = json.load(f)
    abi = artifact.get("abi")
    bytecode = None
    if isinstance(artifact.get("bytecode"), dict):
        bytecode = artifact.get("bytecode", {}).get("object")
    else:
        bytecode = artifact.get("bytecode")
    if not abi:
        raise RuntimeError(f"ABI not found in artifact: {artifact_path}")
    return abi, bytecode

def get_contract(address: str, artifact_path: str) -> Contract:
    if not address or address == "0x0000000000000000000000000000000000000000":
        raise RuntimeError("Contract address missing/zero")
    abi, _ = load_abi_and_bytecode(artifact_path)
    return w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi)

def get_race_contract(addr: Optional[str] = None, artifact: Optional[str] = None) -> Contract:
    address = addr or CONTRACT_ADDRESS
    artifact_path = artifact or ARTIFACT_RACE
    return get_contract(address, artifact_path)

def get_mock_contract(addr: Optional[str] = None, artifact: Optional[str] = None) -> Contract:
    address = addr or VRF_COORDINATOR
    artifact_path = artifact or ARTIFACT_MOCK
    return get_contract(address, artifact_path)

def send_tx(func, signer, value: int = 0, gas: Optional[int] = None, gas_price: Optional[int] = None):
    nonce = w3.eth.get_transaction_count(signer.address)
    tx = func.build_transaction({
        "from": signer.address,
        "nonce": nonce,
        "value": value,
        **({"gas": gas} if gas else {}),
        **({"gasPrice": gas_price} if gas_price else {}),
    })
    signed = w3.eth.account.sign_transaction(tx, private_key=signer.private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt

def parse_eth_value(value_str: str) -> int:
    s = value_str.strip().lower()
    if s.endswith("ether"):
        n = Decimal(s[:-5])
        return int(n * (10 ** 18))
    if s.endswith("gwei"):
        n = Decimal(s[:-4])
        return int(n * (10 ** 9))
    return int(Decimal(s))
