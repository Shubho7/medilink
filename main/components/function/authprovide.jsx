"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { usePharmAuth } from "@/app/_contexts/pharmauthContext"
import { useRouter } from "next/navigation"

export default function Authprovide() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [registerStep, setRegisterStep] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const { token, login } = usePharmAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    type: ""
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLogin) {
      await handleLogin()
    } else if (registerStep === 2) {
      // Fetch user's current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        // Add latitude and longitude to formData
        const updatedFormData = {
          ...formData,
          latitude,
          longitude,
        }
        
        await handleRegister(updatedFormData)
      }, (error) => {
        console.error("Error fetching location:", error)
      })
    }
    setIsOpen(false)
  }

  const handleLogin = async () => {
    try {
      const response = await fetch("pharmacy/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await response.json()
      const token = data.token
      login(token)
      router.push("/pharmacy")
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleRegister = async (updatedFormData) => {
    try {
      const response = await fetch("pharmacy/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      })
      const data = await response.json()
      const token = data.token
      if (token) {
        console.log("Registration successful:", data)
        router.push("/pharmacy")
      }
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleNextStep = () => {
    setRegisterStep(2)
  }

  const handlePrevStep = () => {
    setRegisterStep(1)
  }

  return (
    <div className="bg-transparent ml-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-white bg-transparent hover:bg-white hover:text-black">Are you a provider?</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl">{isLogin ? "Login" : `Register - Step ${registerStep}`}</CardTitle>
              <CardDescription>
                {isLogin ? "Enter your credentials to login" : "Create a new account"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <CardContent className="space-y-4 px-0">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="form-type"
                    checked={isLogin}
                    onCheckedChange={(checked) => {
                      setIsLogin(checked)
                      setRegisterStep(1)
                    }}
                  />
                  <Label htmlFor="form-type">{isLogin ? "Login" : "Register"}</Label>
                </div>

                {isLogin ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" required value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="password" type="password" placeholder="Enter your password" required value={formData.password} onChange={handleInputChange} />
                    </div>
                  </>
                ) : registerStep === 1 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" required value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Enter your password" required value={formData.password} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="Enter your phone number" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Enter your address" required value={formData.address} onChange={handleInputChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hospital">Hospital</SelectItem>
                          <SelectItem value="Clinic">Clinic</SelectItem>
                          <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Removed Latitude and Longitude fields */}
                  </>
                )}
              </CardContent>
              <CardFooter className="px-0 pb-0">
                {isLogin ? (
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                ) : registerStep === 1 ? (
                  <Button type="button" onClick={handleNextStep} className="w-full">
                    Next
                  </Button>
                ) : (
                  <div className="flex w-full space-x-2">
                    <Button type="button" onClick={handlePrevStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Register
                    </Button>
                  </div>
                )}
              </CardFooter>
            </form>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
