import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import braintree from "braintree";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANTID!,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
});

export const POST = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({error: "Unauthoried"}, {status: 500});
        }
        const { paymentMethodNonce, amount } = await req.json();

        const saleResult = await gateway.transaction.sale({
            amount,
            paymentMethodNonce,
            options: {submitForSettlement: true}
        })

        if(saleResult.success){
            const addCredits = Math.floor(Number(amount) * 10);
            await db.user.update({
                where: {
                    id: userId,
                },
                data:{
                    credits: {increment: addCredits},
                }
            });

            return NextResponse.json({transactionId: saleResult.transaction.id, data: addCredits}, {status: 200});
        }else{
            return NextResponse.json({message: "failed", error: saleResult.message}, {status: 404})
        }
    } catch (e) {
        console.log("The erro iin checkout page : ", error);
        return NextResponse.json({errror: "Payment failed"}, {status: 500});
    }
}