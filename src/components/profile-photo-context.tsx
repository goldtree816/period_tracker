import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const PROFILE_STORAGE_KEY = "@period-cycle/profile";

type ProfilePhotoContextValue = {
  profileName: string;
  setProfileName: (name: string) => void;
  profilePhoto: string | null;
  setProfilePhoto: (photo: string | null) => void;
};

const ProfilePhotoContext = createContext<ProfilePhotoContextValue | null>(
  null,
);

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

        if (!storedProfile) return;

        const parsedProfile: unknown = JSON.parse(storedProfile);

        if (typeof parsedProfile !== "object" || parsedProfile === null) {
          throw new Error("Invalid saved profile.");
        }

        const profile = parsedProfile as Record<string, unknown>;

        if (isMounted) {
          if (typeof profile.name === "string") {
            setProfileName(profile.name);
          }

          if (
            typeof profile.profilePhoto === "string" ||
            profile.profilePhoto === null
          ) {
            setProfilePhoto(profile.profilePhoto);
          }
        }
      } catch (error) {
        console.error("Unable to load saved profile:", error);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProfilePhotoContext.Provider
      value={{
        profileName,
        setProfileName,
        profilePhoto,
        setProfilePhoto,
      }}
    >
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export function useProfilePhoto() {
  const context = useContext(ProfilePhotoContext);

  if (!context) {
    throw new Error(
      "useProfilePhoto must be used within a ProfilePhotoProvider.",
    );
  }

  return context;
}
