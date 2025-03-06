import { connectToDatabase } from "@/lib/mongodb";
import User from "@/server/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { platform } = req.query;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    if (
      !platform ||
      typeof platform !== "string" ||
      !["github", "twitter", "linkedin", "udemy", "coursera"].includes(platform)
    ) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the connected identity
    user.connectedIdentities[platform] = true;

    // Calculate new builder score
    const connectedCount = Object.values(user.connectedIdentities).filter(Boolean).length;
    user.builderScore = connectedCount * 10;

    // Update level based on score
    if (user.builderScore >= 40) {
      user.level = "Expert";
    } else if (user.builderScore >= 20) {
      user.level = "Intermediate";
    } else {
      user.level = "Newbie";
    }

    user.lastUpdated = Date.now();
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in simulate-callback:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
