"use client";

import { useState } from "react";
import { useWallet } from "~/lib/wallet-context";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Coins } from "lucide-react";
import { Button } from "~/components/ui/button";
import { bet } from "ponder:schema";

/**
 * ProfileTab displays user info, wallet, achievements, and recent activity.
 */
export function ProfileTab() {
    const { balance, bets, addCoins, updateBetStatus } = useWallet();
    const [selectedBadge, setSelectedBadge] = useState<any>(null);

    const handleAddCoins = () => {
        addCoins(500);
        toast("Coins Added!", {
            description: "500 test coins have been added to your wallet.",
        });
    };

    const handleSimulateWin = (betId: string) => {
        updateBetStatus(betId, "won");
        toast("Congratulations!", {
            description: "Your bet won!",
        });
    };

    const handleSimulateLoss = (betId: string) => {
        updateBetStatus(betId, "lost");
        toast("Better luck next time", {
            description: "Your bet lost.",
        });
    };

    const badges = [
        {
            id: 1,
            name: "First Bet",
            img: "/AchievementsBadges/1.png",
            description: "Awarded for placing your first bet.",
            unlocked: bets.length >= 1, //unlock until user place 1 bet
        },
        {
            id: 2,
            name: "Winner",
            img: "/AchievementsBadges/2.png",
            description: "Earned by winning your first race.",
            unlocked: bets.some(b => b.status === "won"),
        },
        {
            id: 3,
            name: "Lucky Streak",
            img: "/AchievementsBadges/3.png",
            description: "Earned by winning three bets in a row.",
            unlocked: (() => {
                const wins = bets
                    .filter(b => b.status === "won")
                    .sort((a, b) => a.timestamp - b.timestamp);
    
                let streak = 1;
                for (let i = 1; i < wins.length; i++) {
                    if (wins[i - 1].timestamp < wins[i].timestamp) streak++;
                    else streak = 1;
                }
                return streak >= 3;
            })(),

        },
        
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* HEADER */}
            <header className="border-b border-border bg-card rounded-lg">
                <div className="max-w-lg mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src="/placeholder.svg?height=80&width=80" />
                            <AvatarFallback className="text-2xl font-bold">JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">John Doe</h1>
                            <p className="text-sm text-muted-foreground">@johndoe</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-primary/20 text-primary border-primary/30">Level 1</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="max-w-lg mx-auto py-6 space-y-6">

                {/* WALLET SECTION */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Wallet</h2>
                    <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Test Coins</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleAddCoins}>
                                Add Coins
                            </Button>
                        </div>
                        <div className="text-4xl font-bold">{balance.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground mt-1">Available balance</p>
                    </Card>
                </section>

                {/* ACHIEVEMENTS SECTION */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Achievements</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {badges.map((badge) => (
                            <div key={badge.id}>
                                <button
                                    onClick={() => badge.unlocked && setSelectedBadge(badge)}
                                    disabled={!badge.unlocked}
                                    className="flex flex-col items-center hover:scale-105 transition-transform disabled:cursor-not-allowed"                
                                >
                                    <img
                                        src={badge.img}
                                        alt={badge.name}
                                        className={`w-20 h-20 rounded-full object-cover transition-all
                                            ${badge.unlocked ? "" : "opacity-30 grayscale"}`}
                                    />
                                    <span className={`mt-2 text-sm font-medium ${badge.unlocked ? "" : "text-muted-foreground"}`} >{badge.name}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Simple Popup Modal */}
                    {selectedBadge && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                            onClick={() => setSelectedBadge(null)}
                        >
                            <div
                                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm text-center border border-border"
                                style={{ backgroundColor: "#111827", borderColor: "#1f2937" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={selectedBadge.img}
                                    alt={selectedBadge.name}
                                    className="w-24 h-24 mx-auto rounded-full"
                                />
                                <h3 className="text-lg font-bold mt-4">{selectedBadge.name}</h3>

                                <p className="text-sm text-muted-foreground mt-2">
                                    {selectedBadge.description}
                                </p>
                                <Button className="mt-4" onClick={() => setSelectedBadge(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                {/* RECENT ACTIVITY SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Recent Activity</h2>
                        {bets.length === 0 && (
                            <span className="text-sm text-muted-foreground">No bets yet</span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {bets.slice(0, 10).map((bet) => (
                            <Card key={bet.id} className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{bet.raceName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {bet.horseName} • {bet.odds}x odds
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(bet.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{bet.amount} coins</div>
                                            <div className="text-sm text-muted-foreground">Bet amount</div>
                                            {bet.status === "pending" && (
                                                <Badge className="mt-2 bg-secondary text-secondary-foreground">
                                                    Pending
                                                </Badge>
                                            )}
                                            {bet.status === "won" && (
                                                <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                                                    Won
                                                </Badge>
                                            )}
                                            {bet.status === "lost" && (
                                                <Badge className="mt-2 bg-destructive/20 text-destructive border-destructive/30">
                                                    Lost
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {bet.status === "pending" && (
                                        <div className="flex gap-2 pt-2 border-t border-border">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-transparent"
                                                onClick={() => handleSimulateWin(bet.id)}
                                            >
                                                Simulate Win
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-transparent"
                                                onClick={() => handleSimulateLoss(bet.id)}
                                            >
                                                Simulate Loss
                                            </Button>
                                        </div>
                                    )}
                                    {bet.status === "won" && (
                                        <div className="text-sm text-primary font-semibold">
                                            Won: +{bet.potentialWin} coins
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
