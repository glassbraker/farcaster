#!/usr/bin/env python3
import argparse, os
from lib import get_race_contract, load_signer, send_tx, parse_eth_value

def main():
    ap = argparse.ArgumentParser(description="Place an ETH bet on a race")
    ap.add_argument("race_id", type=int)
    ap.add_argument("racer_index", type=int)
    ap.add_argument("--value", required=True, help='Amount, e.g. "0.25ether" or wei')
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    signer = load_signer()
    wei = parse_eth_value(args.value)
    receipt = send_tx(c.functions.bet(args.race_id, args.racer_index), signer, value=wei)
    print("Bet tx:", receipt.transactionHash.hex())

if __name__ == "__main__":
    main()
