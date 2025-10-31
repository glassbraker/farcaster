#!/usr/bin/env python3
import argparse, os
from lib import get_race_contract, load_signer, send_tx

def main():
    ap = argparse.ArgumentParser(description="Permissionless: create a race (only if active < 5)")
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    ap.add_argument("--name", required=True)
    ap.add_argument("--racers", required=True, help='Comma-separated, e.g. "Alpha,Bravo,Charlie"')
    ap.add_argument("--start", type=int, required=True, help="startTime (unix seconds)")
    ap.add_argument("--lock", type=int, required=True, help="lockTime (unix seconds)")
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    signer = load_signer()
    racers = [s.strip() for s in args.racers.split(",") if s.strip()]
    receipt = send_tx(c.functions.createRace(args.name, racers, args.start, args.lock), signer)
    print("Create race tx:", receipt.transactionHash.hex())

if __name__ == "__main__":
    main()
