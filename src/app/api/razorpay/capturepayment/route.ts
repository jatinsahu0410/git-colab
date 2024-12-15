import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET!,
});

export const POST = async (req: NextRequest) => {
    try {
        // authenticate the user 
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({message: "Unauthorized User"}, {status: 404});
        };
        const data = await req.json();
        const amount = data;
        // create options to pass to the razorpay 
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: Math.random().toString(),
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({order, message: "order created successfully"});
    } catch (error) {
        console.log("error in creating order : ", error);
        return NextResponse.json({error: error}, {status: 500});
    }
}