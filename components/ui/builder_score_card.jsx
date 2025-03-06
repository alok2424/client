import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Github, Twitter, Code, Home } from "lucide-react"

export default function BuilderScoreCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-grid-white/[0.05] text-white">
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">What's your</h1>
        <h1 className="text-5xl font-bold tracking-tight">Builder Score?</h1>
      </div>

      <Card className="w-full max-w-md bg-[#111111] border-gray-800 text-white">
        <CardHeader className="flex justify-center pb-2">
          <div className="flex items-center justify-center space-x-6 py-4">
            <Code className="w-6 h-6" />
            <Home className="w-6 h-6" />
            <Github className="w-6 h-6" />
            <Twitter className="w-6 h-6" />
          </div>
          <div className="text-xs text-gray-500 text-center uppercase tracking-wider">Search for any builder</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Input
            placeholder="Enter address, ENS or social handle"
            className="bg-[#0a0a0a] border-gray-800 text-gray-300 h-12"
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12">Calculate Score</Button>
        </CardFooter>
      </Card>

      <div className="mt-20 text-center space-y-4">
        <div className="text-purple-500 font-medium">Talent Protocol</div>
        <h2 className="text-3xl font-bold max-w-2xl">
          Bringing verified reputation onchain to help great builders stand out
        </h2>
      </div>
    </div>
  )
}

