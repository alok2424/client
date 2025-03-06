// This file handles wallet connection functionality

export const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
  
        if (accounts.length > 0) {
          return {
            address: accounts[0],
            status: "Connected to wallet",
          }
        } else {
          return {
            address: "",
            status: "Connect your wallet",
          }
        }
      } catch (error) {
        return {
          address: "",
          status: "Error connecting to wallet",
        }
      }
    } else {
      return {
        address: "",
        status: "Please install MetaMask",
      }
    }
  }
  
  export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })
  
        if (accounts.length > 0) {
          return {
            address: accounts[0],
            status: "Connected to wallet",
          }
        } else {
          return {
            address: "",
            status: "Connect your wallet",
          }
        }
      } catch (error) {
        return {
          address: "",
          status: "Error connecting to wallet",
        }
      }
    } else {
      return {
        address: "",
        status: "Please install MetaMask",
      }
    }
  }
  
  