import braintree from "braintree";
import { NextResponse } from "next/server";

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANTID!,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
});

export async function GET(){
    try {
        const response = await gateway.clientToken.generate({});
        return NextResponse.json({clientToken: response.clientToken}, {status: 200});
    } catch (error) {
        console.log("The error in generating the token : ", error);
        return NextResponse.json({error: error}, {status: 500});
    }
}