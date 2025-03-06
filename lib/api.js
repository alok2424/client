// API functions to interact with the backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const fetchUserProfile = async (walletAddress) => {
  try {
    const response = await fetch(`${API_URL}/users/profile/${walletAddress}`);
    if (!response.ok) {
      if (response.status === 404) {
        // If user doesn't exist, create a new profile
        return createUserProfile(walletAddress);
      }
      throw new Error("Failed to fetch user profile");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (walletAddress) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        name: "",
        bio: "",
        skills: [],
        socialLinks: {
          github: "",
          twitter: "",
          website: "",
        },
        connectedIdentities: {
          github: false,
          twitter: false,
          linkedin: false,
          udemy: false,
          coursera: false,
        },
        builderScore: 0,
        level: "Newbie",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

export const saveWalletAddress = async (walletAddress) => {
  try {
    const response = await fetch(`${API_URL}/users/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      throw new Error("Failed to save wallet address");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving wallet address:", error);
    return null;
  }
};

export const updateUserProfile = async (walletAddress, profileData) => {
  try {
    const response = await fetch(`${API_URL}/users/profile/${walletAddress}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};
