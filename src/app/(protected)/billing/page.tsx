"use client";

import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import dropin, { Dropin } from "braintree-web-drop-in";
import { toast } from "sonner";
import useRefresh from "@/hooks/useRefresh";

const Billing = () => {
    const { data: user } = api.project.getMyCredits.useQuery();
    const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
    const creditsToBuyAmount = creditsToBuy[0]!;
    const price = (creditsToBuyAmount / 10).toFixed(2);
    const refetch = useRefresh();

    const [clientToken, setClientToken] = useState<string | null>(null);
    const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "paypal" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch("/api/braintree/token");
                const data = await res.json();
                if (!res.ok || !data.clientToken) {
                    throw new Error("Failed to fetch the Braintree token.");
                }
                setClientToken(data.clientToken);
            } catch (error) {
                console.error("Token fetch error:", error);
                toast.error("Unable to connect to payment service.");
            }
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (clientToken && selectedPaymentMethod) {
            if (dropinInstance) {
                dropinInstance.teardown(); // Cleanup previous instance
            }
            dropin.create(
                {
                    authorization: clientToken,
                    container: "#dropin-container",
                    paypal: selectedPaymentMethod === "paypal" ? { flow: "checkout" } : undefined,
                    card: selectedPaymentMethod === "card" ? { cardholderName: true } : undefined,
                },
                (err, instance) => {
                    if (err) {
                        console.error("Drop-in Error:", err);
                        toast.error("Payment setup failed.");
                        return;
                    }
                    setDropinInstance(instance!);
                }
            );
        }
    }, [clientToken, selectedPaymentMethod]);

    const handleBuyCredits = async () => {
        if (!dropinInstance) {
            toast.error("Payment not initialized.");
            return;
        }

        try {
            const { nonce } = await dropinInstance.requestPaymentMethod();
            const response = await fetch("/api/braintree/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentMethodNonce: nonce,
                    amount: price,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("Payment successful!");
                refetch();
                setIsModalOpen(false);
            } else {
                throw new Error(result.message || "Payment failed.");
            }
        } catch (error) {
            console.error("Payment processing error:", error);
            toast.error("Payment failed. Please try again.");
        }
    };

    return (
        <div>
            <h1 className="text-xl font-semibold">Billing</h1>
            <p className="text-sm text-gray-500">
                You currently have <strong className="text-black">{user?.credits}</strong> credits.
            </p>
            <div className="bg-blue-50 px-4 py-2 rounded-md text-blue-700 border-blue-300">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">Each credit allows you to index 1 file in a repo</p>
                </div>
                <p className="text-sm">E.g: 100 files require 100 credits.</p>
            </div>
            <Slider
                defaultValue={[100]}
                max={1500}
                min={10}
                step={10}
                onValueChange={setCreditsToBuy}
                value={creditsToBuy}
            />
            <p className="text-lg font-semibold mb-2">Buy {creditsToBuyAmount} credits for Rs. {price}/-</p>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button>Proceed to Payment</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choose Payment Method</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-4 mb-4">
                        <Button
                            variant={selectedPaymentMethod === "card" ? "default" : "outline"}
                            onClick={() => setSelectedPaymentMethod("card")}
                        >
                            Pay with Card
                        </Button>
                        <Button
                            variant={selectedPaymentMethod === "paypal" ? "default" : "outline"}
                            onClick={() => setSelectedPaymentMethod("paypal")}
                        >
                            Pay with PayPal
                        </Button>
                    </div>

                    {selectedPaymentMethod && <div id="dropin-container" className="mb-4"></div>}

                    <Button onClick={handleBuyCredits} disabled={!dropinInstance}>
                        Confirm Payment
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Billing;
