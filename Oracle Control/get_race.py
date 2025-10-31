#!/usr/bin/env python3
import argparse, os, time
from lib import get_race_contract

def main():
    ap = argparse.ArgumentParser(description="Inspect a race")
    ap.add_argument("race_id", type=int)
    ap.add_argument("--address", help="Race contract address")
    ap.add_argument("--artifact", default=os.getenv("ARTIFACT_RACE"))
    args = ap.parse_args()

    c = get_race_contract(args.address, args.artifact)
    r = c.functions.getRace(args.race_id).call()
    (name, racers, startTime, lockTime, settled, winnerIndex, totalPool, poolByRacer, vrfRequested) = r
    print(f"Race {args.race_id}: {name}")
    print("  Racers:", racers)
    print("  startTime:", startTime, time.strftime('(%Y-%m-%d %H:%M:%S)', time.localtime(startTime)))
    print("  lockTime :", lockTime , time.strftime('(%Y-%m-%d %H:%M:%S)', time.localtime(lockTime)))
    print("  settled:", settled, "winnerIndex:", winnerIndex, "vrfRequested:", vrfRequested)
    print("  totalPool:", totalPool)
    print("  poolByRacer:", poolByRacer)

if __name__ == "__main__":
    main()
