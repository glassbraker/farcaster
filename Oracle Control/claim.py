#!/usr/bin/env python3
import argparse, os
from lib import get_race_contract, load_signer, send_tx

def main():
    ap = argparse.ArgumentParser(description="Claim payout for a settled race")
    ap.add_argument("race_id", type=int)
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    signer = load_signer()
    receipt = send_tx(c.functions.claim(args.race_id), signer)
    print("Claim tx:", receipt.transactionHash.hex())

if __name__ == "__main__":
    main()
