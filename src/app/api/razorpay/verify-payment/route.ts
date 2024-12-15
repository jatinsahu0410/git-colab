import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized User" }, { status: 404 });
        }

        const { response, creditsToBuyAmount } = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
        // console.log("The data from frontend is : ", razorpay_order_id, " : ", razorpay_payment_id, " : ", razorpay_signature);
        // console.log("The credits is : ", creditsToBuyAmount);

        // generate the expected signature
        let body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!).update(body.toString()).digest("hex");

        // console.log("The signature: ", expectedSignature);

        // now verify that both matches 
        if (expectedSignature === razorpay_signature) {
            // update the db 
            // console.log("hi");
            const updatedUser = await db.user.update({
                where: {
                    id: userId,
                },
                data: {
                    credits: { increment: creditsToBuyAmount },
                }
            });
            return NextResponse.json({ updatedUser, message: "credit added" }, { status: 200 });
        }
        return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    } catch (error) {
        console.log("The error in verifying the payment : ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}