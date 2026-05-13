import { app } from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Vercel API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
