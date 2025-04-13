"use client";

import { useState, useEffect, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Bell, Shield, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: ""
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || ""
      });
    }
  }, [user]);
  
  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-3 border-purple-500 rounded-full animate-spin border-t-transparent mb-4"></div>
          <p className="text-purple-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    try {
      await user.setProfileImage({ file });
      toast.success("Profile image updated");
    } catch (error) {
      toast.error("Failed to update profile image");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 w-full bg-gray-900/50 p-1 border border-gray-800 rounded-lg">
              <TabsTrigger value="profile" className="flex-1 py-2">
                <UserCog className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 py-2">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <form onSubmit={handleProfileUpdate}>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Profile Information</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-5">
                    <div className="flex gap-4 items-center">
                      <div className="relative group">
                        <img 
                          src={user.imageUrl} 
                          alt="Profile" 
                          className="h-16 w-16 rounded-full border border-purple-500/60"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label className="cursor-pointer">
                            <Upload size={16} className="text-white" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-white">{user.fullName}</p>
                        <p className="text-sm text-gray-400">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="firstName" className="text-sm text-gray-400">
                          First Name
                        </label>
                        <input 
                          id="firstName"
                          name="firstName"
                          type="text" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                          placeholder="First name"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="lastName" className="text-sm text-gray-400">
                          Last Name
                        </label>
                        <input 
                          id="lastName"
                          name="lastName"
                          type="text" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                          placeholder="Last name"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="username" className="text-sm text-gray-400">
                          Username
                        </label>
                        <input 
                          id="username"
                          name="username"
                          type="text" 
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                          placeholder="Username"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-sm text-gray-400">
                          Email
                        </label>
                        <input 
                          id="email"
                          type="email" 
                          value={user.primaryEmailAddress?.emailAddress || ""}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                          disabled
                        />
                      </div>
                    </div>
                  
                    <div className="pt-4">
                    <Button 
                      type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                      disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                        </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Notification settings have been simplified</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Security settings have been simplified</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 