"use client";
import { useEffect } from "react";
import { addGrayBar } from "./GrayBar"; // adjust path if needed

export function HomeTab() {
  useEffect(() => { addGrayBar("Upcoming Races And Events", 1); }, []);
  useEffect(() => { addGrayBar("Active Bets", 25); }, []);
  useEffect(() => { addGrayBar("Popular Wagers", 50); }, []);
  useEffect(() => { addGrayBar("LeaderBoard", 75); }, []);


  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
      <div className="text-center w-full max-w-md mx-auto">
        <p className="text-lg mb-2"> </p>
      </div>
    </div>
  );
}
