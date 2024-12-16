'use client'

import React, { useState } from "react";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefresh from "@/hooks/useRefresh";
import { useRouter } from "next/navigation";

const Billing = () => {
    const { data: user } = api.project.getMyCredits.useQuery();
    const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
    const creditsToBuyAmount = creditsToBuy[0]!;
    const price = (creditsToBuyAmount / 10).toFixed(0);
    const refetch = useRefresh();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Function to dynamically load the Razorpay script
    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js"; // Razorpay CDN
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Handle payment process
    const handlePayment = async () => {
        setLoading(true);

        try {
            // Load Razorpay script dynamically
            const isRazorpayLoaded = await loadRazorpayScript();
            if (!isRazorpayLoaded) {
                toast.error("Failed to load Razorpay. Please try again.");
                setLoading(false);
                return;
            }

            // Create the order on your backend
            const res = await fetch("/api/razorpay/capturepayment", {
                method: "POST",
                body: JSON.stringify(price),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { order } = await res.json();
            // the order created is 
            console.log("The order is : ", order);
            if (!order) {
                toast.error("Order creation failed");
                throw new Error("Failed to create order");
            }

            // Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
                amount: order.amount,
                currency: order.currency,
                name: "Git-Colab",
                description: "Purchase credits to use in the website",
                order_id: order.id,
                handler: async (response: any) => {
                    console.log("The response is : ", { response, creditsToBuyAmount });
                    // Verify payment
                    const verifyRes = await fetch("/api/razorpay/verify-payment", {
                        method: "POST",
                        body: JSON.stringify({ response, creditsToBuyAmount }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    const data = await verifyRes.json();
                    console.log("The verify payment is : ", data);
                    if (verifyRes.ok) {
                        toast.success(`Payment successful! ${creditsToBuyAmount} credits added.`);
                        refetch();
                        router.push('/create');
                    } else {
                        throw new Error("Payment verification failed");
                    }
                },
            };

            if (typeof window !== "undefined") {
                // Client-side-only code here
                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-xl font-semibold">Billing</h1>
            <p className="text-sm text-gray-500">
                You currently have <strong className="text-black">{user?.credits}</strong> credits.
            </p>
            <div className="h-2"></div>
            <div className="bg-blue-50 px-4 py-2 rounded-md text-blue-700 border-blue-300">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">Each credit allows you to index 1 file in a repo</p>
                </div>
                <p className="text-sm">E.g: 100 files require 100 credits.</p>
            </div>
            <div className="h-4"></div>
            <Slider
                defaultValue={[100]}
                max={1500}
                min={10}
                step={10}
                onValueChange={setCreditsToBuy}
                value={creditsToBuy}
            />
            <div className="h-4"></div>
            <Button onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : `Buy ${creditsToBuyAmount} credits for $${price}`}
            </Button>
        </div>
    );
};

export default Billing;
