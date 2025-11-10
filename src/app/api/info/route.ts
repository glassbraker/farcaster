import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";

const RACE_ABI = [
  { type: "function", name: "activeRaceIds", stateMutability: "view", inputs: [], outputs: [{ type: "uint256[]" }] },
  {
    type: "function",
    name: "getRace",
    stateMutability: "view",
    inputs: [{ name: "raceId", type: "uint256" }],
    outputs: [
      { type: "string" },    // name
      { type: "string[]" },  // racers
      { type: "uint64" },    // startTime
      { type: "uint64" },    // lockTime
      { type: "bool" },      // settled
      { type: "uint8" },     // winnerIndex
      { type: "uint256" },   // totalPool
      { type: "uint256[]" }, // poolByRacer
      { type: "bool" },      // vrfRequested
    ],
  },
] as const;

// -----------------------------------------------------------------------------
// Configuration (consider moving to .env.local)
// -----------------------------------------------------------------------------
const RPC_URL = "http://127.0.0.1:8545"; // or http://127.0.0.1:8545
const RACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const client = createPublicClient({ transport: http(RPC_URL) });

// Shape a single race into a rich object (and backward-compatible fields)
function shapeRace(
  id: bigint,
  tuple: [string, string[], bigint, bigint, boolean, number, bigint, bigint[], boolean]
) {
  const [name, racers, startTime, lockTime, settled, winnerIndex, totalPool, poolByRacer, vrfRequested] = tuple;
  const now = Math.floor(Date.now() / 1000);
  const locked = now >= Number(lockTime);
  const secondsToLock = Math.max(0, Number(lockTime) - now);
  const status: "open" | "locked" | "settled" = settled ? "settled" : locked ? "locked" : "open";

  return {
    // legacy/whitebar compatibility
    id: String(id),
    name,
    time: new Date(Number(lockTime) * 1000).toISOString(),

    // full data for races/[id]
    raceId: String(id),
    racers,
    startTime: Number(startTime),
    lockTime: Number(lockTime),
    settled,
    winnerIndex: Number(winnerIndex),
    vrfRequested,

    // raw (stringified)
    totalPoolWei: totalPool.toString(),
    poolByRacerWei: poolByRacer.map((x) => x.toString()),

    // pretty
    totalPoolEth: formatEther(totalPool),
    poolByRacerEth: poolByRacer.map(formatEther),

    // UI helpers
    status,
    locked,
    secondsToLock,
  };
}

export async function GET() {
  try {
    if (!RACE_ADDRESS || !RACE_ADDRESS.startsWith("0x") || RACE_ADDRESS.length !== 42) {
      throw new Error("Invalid RACE_ADDRESS");
    }

    // 1) Get active IDs
    const ids = (await client.readContract({
      address: RACE_ADDRESS as `0x${string}`,
      abi: RACE_ABI,
      functionName: "activeRaceIds",
    })) as bigint[];

    if (!ids?.length) return NextResponse.json([], { status: 200 });

    // 2) Fetch each race individually (NO multicall)
    const tuples = await Promise.all(
      ids.map((id) =>
        client.readContract({
          address: RACE_ADDRESS as `0x${string}`,
          abi: RACE_ABI,
          functionName: "getRace",
          args: [id],
        }) as Promise<[string, string[], bigint, bigint, boolean, number, bigint, bigint[], boolean]>
      )
    );

    // 3) Shape, filter, sort
    const nowSec = Math.floor(Date.now() / 1000);
    const races = tuples
      .map((tuple, i) => shapeRace(ids[i], tuple))
      .filter((r) => r.lockTime > nowSec || r.settled) // keep upcoming + settled
      .sort((a, b) => a.lockTime - b.lockTime);

    return NextResponse.json(races, { status: 200 });
  } catch (e: any) {
    console.error("❌ /api/info error:", e);
    return NextResponse.json(
      { error: "Failed to read from contract", details: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Delete not supported; races are on-chain" },
    { status: 405 },
  );
}
