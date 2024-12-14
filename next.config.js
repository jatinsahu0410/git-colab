/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images:{
        remotePatterns:[
            {
                protocol: "https",
                hostname: "img.icons8.com"
            },
            {
                protocol: "https",
                hostname: "img.clerk.com"
            },
            {
                protocol: "https",
                hostname: "ik.imagekit.io"
            }
        ]
    }
};

export default config;
