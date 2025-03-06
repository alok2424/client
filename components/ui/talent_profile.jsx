"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, User, Gift, Bell, Settings, DollarSign, Wallet, Github, Twitter, Globe } from "lucide-react"
import { useToast } from "@/components/ui/usetoast"
import { connectWallet, getCurrentWalletConnected } from "@/lib/wallet"
import { fetchUserProfile, saveWalletAddress, updateUserProfile } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function TalentProfile() {
  const { toast } = useToast()
  const [walletAddress, setWalletAddress] = useState("")
  const [status, setStatus] = useState("")
  const [profile, setProfile] = useState({
    builderScore: 0,
    level: "Newbie",
    walletAddress: "",
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
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({ ...profile })
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    const init = async () => {
      try {
        // Check if wallet is already connected
        const { address, status } = await getCurrentWalletConnected()
        setWalletAddress(address)
        setStatus(status)

        if (address) {
          // Fetch user profile if wallet is connected
          const userProfile = await fetchUserProfile(address)
          if (userProfile) {
            setProfile(userProfile)
            setEditedProfile(userProfile)
          }
        }
      } catch (error) {
        console.error("Initialization error:", error)
        toast({
          title: "Error",
          description: "Failed to initialize wallet connection",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()
    addWalletListener()
  }, [toast])

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setStatus("Connected to wallet")

          // Fetch or create profile for the new wallet
          const userProfile = await fetchUserProfile(accounts[0])
          if (userProfile) {
            setProfile(userProfile)
            setEditedProfile(userProfile)
          }
        } else {
          setWalletAddress("")
          setStatus("Connect your wallet")
        }
      })
    }
  }

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true)
      const { address, status } = await connectWallet()
      setWalletAddress(address)
      setStatus(status)

      if (address) {
        // Save wallet address to backend
        await saveWalletAddress(address)

        // Fetch user profile
        const userProfile = await fetchUserProfile(address)
        if (userProfile) {
          setProfile(userProfile)
          setEditedProfile(userProfile)
        }

        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        })
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      const updatedProfile = await updateUserProfile(walletAddress, editedProfile)
      if (updatedProfile) {
        setProfile(updatedProfile)
        setIsEditing(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Update Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill && !editedProfile.skills.includes(newSkill)) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill],
      })
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter((s) => s !== skill),
    })
  }

  // Replace the handleConnectIdentity function with this implementation
  const handleConnectIdentity = (platform) => {
    // Set loading state
    setIsLoading(true)

    // Define OAuth URLs for each platform
    const oauthUrls = {
      github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/callback/github`)}&scope=read:user`,
      twitter: `https://twitter.com/i/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/callback/twitter`)}&scope=tweet.read%20users.read&response_type=code&state=${walletAddress}`,
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/callback/linkedin`)}&scope=r_liteprofile&response_type=code&state=${walletAddress}`,
      udemy: `https://www.udemy.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_UDEMY_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/callback/udemy`)}&response_type=code&state=${walletAddress}`,
      coursera: `https://accounts.coursera.org/oauth2/v1/auth?client_id=${process.env.NEXT_PUBLIC_COURSERA_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/callback/coursera`)}&response_type=code&scope=view_profile&state=${walletAddress}`,
    }

    // For demo purposes, we'll use a simulated OAuth flow
    // In a real app, we would redirect to the actual OAuth URL
    if (process.env.NODE_ENV === "development" || !process.env[`NEXT_PUBLIC_${platform.toUpperCase()}_CLIENT_ID`]) {
      // Simulate OAuth flow with a confirmation dialog
      const confirmConnect = window.confirm(`This will redirect you to ${platform} to authorize access. Continue?`)

      if (confirmConnect) {
        // Simulate a redirect and callback
        simulateOAuthCallback(platform)
      } else {
        setIsLoading(false)
      }
    } else {
      // Redirect to the actual OAuth URL
      window.location.href = oauthUrls[platform]
    }
  }

  // Add this new function to simulate OAuth callback
  const simulateOAuthCallback = async (platform) => {
    try {
      // Simulate a delay for the OAuth process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Call the API to update the connected identity
      const response = await fetch(`/api/auth/simulate-callback/${platform}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        throw new Error(`Failed to connect ${platform}`)
      }

      // Get the updated profile with the new connection
      const updatedProfile = await response.json()

      // Update the local state
      setProfile(updatedProfile)

      // Show success toast
      toast({
        title: "Identity Connected",
        description: `Successfully connected ${platform}. +10 Builder Score!`,
      })
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error)
      toast({
        title: "Connection Error",
        description: `Failed to connect ${platform}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-gray-200">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <nav className="space-y-4 flex-1">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <Search className="w-5 h-5 text-gray-400" />
            <span>Search</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md bg-gray-900 cursor-pointer">
            <User className="w-5 h-5 text-gray-400" />
            <span>Profile</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <Gift className="w-5 h-5 text-gray-400" />
            <span>Perks</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <span>$TALENT</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <Bell className="w-5 h-5 text-gray-400" />
            <span>Notifications</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900 cursor-pointer">
            <Wallet className="w-5 h-5 text-gray-400" />
            <span>Wallet</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
          <div>
            {walletAddress ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex space-x-4">
            {!walletAddress ? (
              <Button
                onClick={handleConnectWallet}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  Sign up
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  Sign in
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Profile Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="bg-gray-800">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "TP"}
              </AvatarFallback>
            </Avatar>

            {isLoading ? (
              <Skeleton className="h-8 w-48 bg-gray-800" />
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold">{profile.name || "Anonymous Builder"}</h2>
                {profile.bio && <p className="text-gray-400 mt-2">{profile.bio}</p>}
              </div>
            )}

            {walletAddress && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4 text-sm">
                Edit Profile
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid grid-cols-4 bg-gray-900">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="text-7xl font-bold mb-2">{profile.builderScore}</div>
                  <div className="text-gray-400 mb-1">Builder Score</div>
                  <div className="text-gray-500 text-sm mb-6">{profile.level}</div>

                  {/* Progress Circle */}
                  <div className="relative w-16 h-16 mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-purple-600"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={`${251.2 - (profile.builderScore / 100) * 251.2}`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                  </div>

                  {/* Score Breakdown */}
                  {walletAddress && profile.builderScore > 0 && (
                    <div className="w-full max-w-md mt-4 mb-4">
                      <h3 className="text-sm font-medium text-center mb-3">Score Breakdown</h3>
                      <div className="space-y-2">
                        {profile.connectedIdentities.github && (
                          <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <Github size={16} />
                              <span>GitHub</span>
                            </div>
                            <span className="text-green-500">+10</span>
                          </div>
                        )}
                        {profile.connectedIdentities.twitter && (
                          <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <Twitter size={16} />
                              <span>Twitter</span>
                            </div>
                            <span className="text-green-500">+10</span>
                          </div>
                        )}
                        {profile.connectedIdentities.linkedin && (
                          <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              <span>LinkedIn</span>
                            </div>
                            <span className="text-green-500">+10</span>
                          </div>
                        )}
                        {profile.connectedIdentities.udemy && (
                          <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm-1.02 14.508l-3.9-3.9 1.414-1.414 2.486 2.486 5.486-5.486 1.414 1.414-6.9 6.9z" />
                              </svg>
                              <span>Udemy</span>
                            </div>
                            <span className="text-green-500">+10</span>
                          </div>
                        )}
                        {profile.connectedIdentities.coursera && (
                          <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d={
                                    "M11.7 17.5c-3.6 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4 6.4 2.9 6.4 6.4-2.8 6.4-6.4 6.4zm0-15.3C6.3 2.2 2 6.5 2 11.9s4.4 9.7 9.7 9.7 9.7-4.4 9.7-9.7-4.3-9.7-9.7-9.7z"
                                  }
                                />
                              </svg>
                              <span>Coursera</span>
                            </div>
                            <span className="text-green-500">+10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!walletAddress && (
                    <Button
                      onClick={handleConnectWallet}
                      className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? "Connecting..." : "Connect Wallet to View Score"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No activity yet</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="identity">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full bg-gray-800" />
                      <Skeleton className="h-12 w-full bg-gray-800" />
                    </div>
                  ) : walletAddress ? (
                    isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <Input
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bio</label>
                          <Input
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">GitHub</label>
                          <Input
                            value={editedProfile.socialLinks.github}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                socialLinks: { ...editedProfile.socialLinks, github: e.target.value },
                              })
                            }
                            className="bg-gray-800 border-gray-700"
                            placeholder="GitHub username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Twitter</label>
                          <Input
                            value={editedProfile.socialLinks.twitter}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                socialLinks: { ...editedProfile.socialLinks, twitter: e.target.value },
                              })
                            }
                            className="bg-gray-800 border-gray-700"
                            placeholder="Twitter handle"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Website</label>
                          <Input
                            value={editedProfile.socialLinks.website}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                socialLinks: { ...editedProfile.socialLinks, website: e.target.value },
                              })
                            }
                            className="bg-gray-800 border-gray-700"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      (
                        <div className="space-y-6">
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                          <span>Wallet Address</span>
                          <span className="text-sm text-gray-400">{walletAddress}</span>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-4">Connect Identities</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Connect your accounts to increase your Builder Score. Each connected account adds +10 to
                            your score.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* GitHub Card */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Github className="w-6 h-6 text-white" />
                                    <div>
                                      <h4 className="font-medium">GitHub</h4>
                                      <p className="text-xs text-gray-400">Connect your GitHub account</p>
                                    </div>
                                  </div>
                                  {profile.connectedIdentities.github ? (
                                    <Badge className="bg-green-600">Connected</Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleConnectIdentity("github")}
                                      disabled={isLoading}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Twitter Card */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Twitter className="w-6 h-6 text-white" />
                                    <div>
                                      <h4 className="font-medium">Twitter</h4>
                                      <p className="text-xs text-gray-400">Connect your Twitter account</p>
                                    </div>
                                  </div>
                                  {profile.connectedIdentities.twitter ? (
                                    <Badge className="bg-green-600">Connected</Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleConnectIdentity("twitter")}
                                      disabled={isLoading}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* LinkedIn Card */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <svg
                                      className="w-6 h-6 text-white"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    <div>
                                      <h4 className="font-medium">LinkedIn</h4>
                                      <p className="text-xs text-gray-400">Connect your LinkedIn account</p>
                                    </div>
                                  </div>
                                  {profile.connectedIdentities.linkedin ? (
                                    <Badge className="bg-green-600">Connected</Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleConnectIdentity("linkedin")}
                                      disabled={isLoading}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Udemy Card */}
                                                     {/* Udemy Card */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <svg
                                      className="w-6 h-6 text-white"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm-1.02 14.508l-3.9-3.9 1.414-1.414 2.486 2.486 5.486-5.486 1.414 1.414-6.9 6.9z" />
                                    </svg>
                                    <div>
                                      <h4 className="font-medium">Udemy</h4>
                                      <p className="text-xs text-gray-400">Connect your Udemy account</p>
                                    </div>
                                  </div>
                                  {profile.connectedIdentities.udemy ? (
                                    <Badge className="bg-green-600">Connected</Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleConnectIdentity("udemy")}
                                      disabled={isLoading}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Coursera Card */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <svg
                                      className="w-6 h-6 text-white"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d={
                                          'M11.7 17.5c-3.6 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4 6.4 2.9 6.4 6.4-2.8 6.4-6.4 6.4zm0-15.3                                      C6.3 2.2 2 6.5 2 11.9s4.4 9.7 9.7 9.7 9.7-4.4 9.7-9.7-4.3-9.7-9.7-9.7z'
                                        }
                                      />
                                    </svg>
                                    <div>
                                      <h4 className="font-medium">Coursera</h4>
                                      <p className="text-xs text-gray-400">Connect your Coursera account</p>
                                    </div>
                                  </div>
                                  {profile.connectedIdentities.coursera ? (
                                    <Badge className="bg-green-600">Connected</Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleConnectIdentity("coursera")}
                                      disabled={isLoading}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {profile.socialLinks && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">Social Links</h3>
                            <div className="flex flex-col space-y-2">
                              {profile.socialLinks.github && (
                                <a
                                  href={`https://github.com/${profile.socialLinks.github}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-gray-400 hover:text-white"
                                >
                                  <Github size={16} />
                                  <span>{profile.socialLinks.github}</span>
                                </a>
                              )}
                              {profile.socialLinks.twitter && (
                                <a
                                  href={`https://twitter.com/${profile.socialLinks.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-gray-400 hover:text-white"
                                >
                                  <Twitter size={16} />
                                  <span>{profile.socialLinks.twitter}</span>
                                </a>
                              )}
                              {profile.socialLinks.website && (
                                <a
                                  href={profile.socialLinks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-gray-400 hover:text-white"
                                >
                                  <Globe size={16} />
                                  <span>{profile.socialLinks.website}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      )
                    )
                  ) : (
                    <p className="text-center text-gray-500">Connect wallet to view identity information</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full bg-gray-800" />
                      <Skeleton className="h-12 w-full bg-gray-800" />
                    </div>
                  ) : walletAddress ? (
                    isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Add Skills</label>
                          <div className="flex space-x-2">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Enter a skill"
                            />
                            <Button onClick={handleAddSkill} className="bg-purple-600 hover:bg-purple-700">
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">Current Skills</label>
                          <div className="flex flex-wrap gap-2">
                            {editedProfile.skills && editedProfile.skills.length > 0 ? (
                              editedProfile.skills.map((skill, index) => (
                                <Badge key={index} className="bg-gray-800 hover:bg-gray-700 px-3 py-1">
                                  {skill}
                                  <button
                                    className="ml-2 text-gray-400 hover:text-white"
                                    onClick={() => handleRemoveSkill(skill)}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <p className="text-gray-500">No skills added yet</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, index) => (
                              <Badge key={index} className="bg-gray-800 px-3 py-1">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No skills added yet</p>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <p className="text-center text-gray-500">Connect wallet to view skills</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

