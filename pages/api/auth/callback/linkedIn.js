import { connectToDatabase } from "@/lib/mongodb";
import User from "@/server/models/User";

export default async function handler(req, res) {
  // Get the code from the query
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ message: "Missing code or state parameter" });
  }

  try {
    // In a real app, we would exchange the code for an access token
    // For this demo, we'll simulate a successful authentication

    // Connect to MongoDB
    await connectToDatabase();

    // The state parameter contains the wallet address
    const walletAddress = state.toLowerCase();

    // Find the user
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the connected identity
    user.connectedIdentities.linkedin = true;

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

    // Redirect back to the profile page
    res.redirect(`/?success=linkedin`);
  } catch (error) {
    console.error("Error in LinkedIn callback:", error);
    res.redirect(`/?error=linkedin`);
  }
}
