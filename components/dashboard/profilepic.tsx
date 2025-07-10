"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ProfilePicContextType {
  profilePic: string | null;
  setProfilePic: (pic: string | null) => void;
}

const ProfilePicContext = createContext<ProfilePicContextType | undefined>(undefined);

export function ProfilePicProvider({ children }: { children: ReactNode }) {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfilePic(localStorage.getItem("profilePic") || null);
    }
  }, []);

  const updateProfilePic = (pic: string | null) => {
    setProfilePic(pic);
    if (typeof window !== "undefined") {
      if (pic) {
        localStorage.setItem("profilePic", pic);
      } else {
        localStorage.removeItem("profilePic");
      }
    }
  };

  return (
    <ProfilePicContext.Provider value={{ profilePic, setProfilePic: updateProfilePic }}>
      {children}
    </ProfilePicContext.Provider>
  );
}

export function useProfilePic() {
  const context = useContext(ProfilePicContext);
  if (!context) {
    throw new Error("useProfilePic must be used within a ProfilePicProvider");
  }
  return context;
}