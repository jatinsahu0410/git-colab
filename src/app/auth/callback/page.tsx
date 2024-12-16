/* eslint-disable @typescript-eslint/no-unsafe-call */
'use server'
import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation";

const Callback = async () => {
    // console.log("The callback funciton is hit : ");
    const { userId } = await auth();
    if (!userId) {
        throw new Error('User Not Found');
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (!user.emailAddresses[0]?.emailAddress) {
        // console.log("The notfound page: ");
        return notFound()
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await db.user.upsert({
        where: {
            email: user.emailAddresses[0]?.emailAddress ?? ""
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create:{
            id: userId,
            email: user.emailAddresses[0]?.emailAddress ?? "",
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    })
    // console.log("The callback hit : ");
    return redirect('/dashboard')
}
export default Callback;