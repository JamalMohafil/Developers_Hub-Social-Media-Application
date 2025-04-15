import { registerAs } from "@nestjs/config";

export default registerAs("prisma", () => ({
    optimizeApiKey: process.env.OPTIMIZE_API_KEY
}));