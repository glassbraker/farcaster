#!/usr/bin/env python3
import argparse, os
from lib import get_race_contract, load_signer, send_tx

def main():
    ap = argparse.ArgumentParser(description="Request VRF settlement after lockTime; prints requestId from logs")
    ap.add_argument("race_id", type=int)
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    signer = load_signer()

    receipt = send_tx(c.functions.requestSettle(args.race_id), signer)
    print("requestSettle tx:", receipt.transactionHash.hex())

    try:
        evs = c.events.SettlementRequested().process_receipt(receipt)
        if evs:
            print("requestId:", evs[0]['args']['requestId'])
        else:
            print("No SettlementRequested event found.")
    except Exception as e:
        print("Event parse error:", e)

if __name__ == "__main__":
    main()
