#!/usr/bin/env python3
import argparse, os
from lib import get_race_contract

def main():
    ap = argparse.ArgumentParser(description="List active race IDs")
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    ids = c.functions.activeRaceIds().call()
    print("Active race IDs:", ids)

if __name__ == "__main__":
    main()
