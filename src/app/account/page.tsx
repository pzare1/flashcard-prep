"use client";

import { useState, useEffect, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { UserCog, Upload, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

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
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

  const handleRemoveAvatar = async () => {
    try {
      await user.setProfileImage({ file: null });
      toast.success("Profile image removed");
    } catch (error) {
      console.error("Error removing profile image:", error);
      toast.error("Failed to remove profile image");
    }
  };
  
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b bg-gray-900/90">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
            <UserCog className="w-6 h-6 mr-2 text-purple-400" />
            Account Settings
          </h1>
          
          <form onSubmit={handleProfileUpdate}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative group">
                    <img 
                      src={user.imageUrl} 
                      alt="Profile" 
                      className="h-24 w-24 rounded-full border-2 border-purple-500/60 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <Upload size={18} className="text-white" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove picture
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                        First Name
                      </label>
                      <input 
                        id="firstName"
                        name="firstName"
                        type="text" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700/50 text-gray-200 rounded-lg 
                        border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        placeholder="First name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                        Last Name
                      </label>
                      <input 
                        id="lastName"
                        name="lastName"
                        type="text" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700/50 text-gray-200 rounded-lg 
                        border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        placeholder="Last name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Username
                      </label>
                      <input 
                        id="username"
                        name="username"
                        type="text" 
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700/50 text-gray-200 rounded-lg 
                        border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        placeholder="Username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <input 
                        id="email"
                        type="email" 
                        value={user.primaryEmailAddress?.emailAddress || ""}
                        className="w-full px-3 py-2 bg-gray-700/70 text-gray-400 rounded-lg 
                        border border-gray-600 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
                            bg-gradient-to-r from-purple-600 to-indigo-600 
                            hover:from-purple-700 hover:to-indigo-700 text-white
                            ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
} 