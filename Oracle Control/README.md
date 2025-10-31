# forge_vrf_py — Python scripts for the VRF (fully on-chain) version

This toolkit talks to the **RaceParimutuelETH_VRF** contract (permissionless, no owner/oracle). It also includes helpers for the **MockVRFCoordinatorV2** so you can test locally on Anvil.

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env for RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, VRF_COORDINATOR, ARTIFACT_RACE, ARTIFACT_MOCK
```

Ensure you compiled contracts with Foundry so the artifacts exist:
```bash
forge build
```

## Scripts

- `create_race.py` — Add a race (anyone can call while active < 5).
- `active_races.py` — List active race IDs.
- `get_race.py` — Inspect a race details.
- `bet.py` — Place an ETH bet.
- `request_settle.py` — After lockTime, request VRF randomness. Prints the emitted `requestId`.
- `mock_fulfill.py` — (Local only) Fulfill the mock coordinator with a chosen random word.
- `claim.py` — Winners claim payout after settlement.

Tip: Use `--help` on any script for args.
