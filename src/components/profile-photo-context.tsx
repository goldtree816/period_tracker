import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const PROFILE_STORAGE_KEY = '@period-cycle/profile';

type ProfilePhotoContextValue = {
  profilePhoto: string | null;
  setProfilePhoto: (photo: string | null) => void;
};

const ProfilePhotoContext = createContext<ProfilePhotoContextValue | null>(null);

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfilePhoto() {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile === null) {
          return;
        }

        const parsedProfile: unknown = JSON.parse(storedProfile);
        if (
          typeof parsedProfile !== 'object' ||
          parsedProfile === null ||
          !('profilePhoto' in parsedProfile) ||
          (typeof parsedProfile.profilePhoto !== 'string' &&
            parsedProfile.profilePhoto !== null)
        ) {
          throw new Error('Saved profile photo has an unexpected format.');
        }

        if (isMounted) {
          setProfilePhoto(parsedProfile.profilePhoto);
        }
      } catch (error) {
        console.error('Unable to load the saved profile photo.', error);
      }
    }

    void loadProfilePhoto();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProfilePhotoContext.Provider value={{ profilePhoto, setProfilePhoto }}>
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export function useProfilePhoto() {
  const context = useContext(ProfilePhotoContext);
  if (!context) {
    throw new Error('useProfilePhoto must be used within a ProfilePhotoProvider.');
  }
  return context;
}
