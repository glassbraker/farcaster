#!/usr/bin/env python3
import argparse, os
from web3 import Web3
from lib import get_mock_contract, load_signer, send_tx

def main():
    ap = argparse.ArgumentParser(description="(Local) Fulfill MockVRFCoordinatorV2 with a chosen random word")
    ap.add_argument("consumer_address", help="Race contract address (consumer)")
    ap.add_argument("request_id", type=int, help="Request ID from request_settle")
    ap.add_argument("--random-word", type=int, default=None, help="Optional random word; default uses keccak(request_id, signer)")
    ap.add_argument("--coordinator", help="Mock coordinator address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_MOCK"))
    args = ap.parse_args()

    c = get_mock_contract(args.coordinator, args.artifact)
    signer = load_signer()

    rnd = args.random_word
    if rnd is None:
        rnd = int(Web3.keccak(text=f"{args.request_id}-{signer.address}").hex(), 16)

    receipt = send_tx(c.functions.fulfill(args.consumer_address, args.request_id, rnd), signer)
    print("Mock fulfill tx:", receipt.transactionHash.hex())

if __name__ == "__main__":
    main()
