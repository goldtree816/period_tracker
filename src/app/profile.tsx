import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfilePhoto } from '@/components/profile-photo-context';

const PROFILE_STORAGE_KEY = '@period-cycle/profile';

type SavedProfile = {
  name: string;
  age: string;
  height: string;
  profilePhoto: string | null;
};

function isSavedProfile(value: unknown): value is SavedProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;
  return (
    typeof profile.name === 'string' &&
    typeof profile.age === 'string' &&
    typeof profile.height === 'string' &&
    (typeof profile.profilePhoto === 'string' || profile.profilePhoto === null)
  );
}

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const { profilePhoto, setProfilePhoto } = useProfilePhoto();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile === null) {
          return;
        }

        const parsedProfile: unknown = JSON.parse(storedProfile);
        if (!isSavedProfile(parsedProfile)) {
          throw new Error('Saved profile has an unexpected format.');
        }

        if (isMounted) {
          setName(parsedProfile.name);
          setAge(parsedProfile.age);
          setHeight(parsedProfile.height);
          setProfilePhoto(parsedProfile.profilePhoto);
        }
      } catch {
        if (isMounted) {
          setSaveMessage({
            type: 'error',
            text: 'Could not load your saved profile. You can still update and save it.',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [setProfilePhoto]);

  function clearSaveMessage() {
    setSaveMessage(null);
  }

  async function saveProfile() {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const profile: SavedProfile = { name, age, height, profilePhoto };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      setSaveMessage({ type: 'success', text: 'Your profile has been saved on this device.' });
    } catch {
      setSaveMessage({
        type: 'error',
        text: 'Could not save your profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function chooseProfilePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
        clearSaveMessage();
      }
    } catch {
      Alert.alert('Unable to select photo', 'Please try choosing a photo again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.eyebrow}>YOUR WELLNESS SPACE</Text>
              <Text style={styles.title}>My profile</Text>
            </View>
            <View style={styles.headerFlower}>
              <Text style={styles.headerFlowerText}>✿</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            A little about you helps make your cycle journey feel more personal.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardDecoration} />
          <Pressable
            accessibilityLabel={profilePhoto ? 'Change profile photo' : 'Add profile photo'}
            accessibilityRole="button"
            disabled={isLoading || isSaving}
            onPress={chooseProfilePhoto}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
            <View style={styles.avatar}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarFlower}>✿</Text>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeText}>+</Text>
            </View>
          </Pressable>
          <Text style={styles.profileName}>{name.trim() || 'Your profile'}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading || isSaving}
            onPress={chooseProfilePhoto}
            style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}>
            <Text style={styles.photoButtonText}>
              {profilePhoto ? 'Change photo' : 'Add a profile photo'}
            </Text>
          </Pressable>
          <Text style={styles.photoHint}>A friendly face for your wellness space</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>♡</Text>
            </View>
            <View style={styles.sectionHeadingCopy}>
              <Text style={styles.sectionTitle}>About you</Text>
              <Text style={styles.sectionSubtitle}>Your details, just for you</Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                accessibilityLabel="Name"
                autoCapitalize="words"
                editable={!isLoading && !isSaving}
                onChangeText={(value) => {
                  setName(value);
                  clearSaveMessage();
                }}
                placeholder="Enter your name"
                placeholderTextColor="#A6A1AC"
                returnKeyType="next"
                style={styles.input}
                value={name}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                accessibilityLabel="Age"
                editable={!isLoading && !isSaving}
                keyboardType="number-pad"
                onChangeText={(value) => {
                  setAge(value);
                  clearSaveMessage();
                }}
                placeholder="Enter your age"
                placeholderTextColor="#A6A1AC"
                returnKeyType="next"
                style={styles.input}
                value={age}
              />
              <Text style={styles.unit}>years</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                accessibilityLabel="Height"
                editable={!isLoading && !isSaving}
                keyboardType="decimal-pad"
                onChangeText={(value) => {
                  setHeight(value);
                  clearSaveMessage();
                }}
                placeholder="Enter your height"
                placeholderTextColor="#A6A1AC"
                returnKeyType="done"
                style={styles.input}
                value={height}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading || isSaving }}
          disabled={isLoading || isSaving}
          onPress={() => void saveProfile()}
          style={({ pressed }) => [
            styles.saveButton,
            (isLoading || isSaving) && styles.saveButtonDisabled,
            pressed && !isLoading && !isSaving && styles.pressed,
          ]}>
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Loading profile...' : isSaving ? 'Saving...' : 'Save profile'}
          </Text>
        </Pressable>
        {saveMessage ? (
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole={saveMessage.type === 'error' ? 'alert' : 'text'}
            style={[
              styles.saveMessage,
              saveMessage.type === 'error' ? styles.saveError : styles.saveSuccess,
            ]}>
            {saveMessage.text}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8FB',
  },
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#B34E70',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  title: {
    color: '#292842',
    fontSize: 28,
    fontWeight: '700',
  },
  headerFlower: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE6EE',
  },
  headerFlowerText: {
    color: '#E75E86',
    fontSize: 25,
  },
  subtitle: {
    color: '#777382',
    fontSize: 14,
    lineHeight: 21,
  },
  profileCard: {
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    borderRadius: 22,
    backgroundColor: '#FCEAF0',
  },
  profileCardDecoration: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -105,
    right: -42,
    borderRadius: 75,
    backgroundColor: '#F8D8E4',
  },
  avatarButton: {
    marginBottom: 10,
  },
  avatar: {
    width: 104,
    height: 104,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F8D8E4',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFlower: {
    color: '#E75E86',
    fontSize: 46,
  },
  cameraBadge: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 29,
    height: 29,
    borderWidth: 2,
    borderColor: '#FCEAF0',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E75E86',
  },
  cameraBadgeText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 24,
  },
  profileName: {
    color: '#292842',
    fontSize: 18,
    fontWeight: '700',
  },
  photoButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  photoButtonText: {
    color: '#B34E70',
    fontSize: 13,
    fontWeight: '700',
  },
  photoHint: {
    marginTop: 8,
    color: '#8D7480',
    fontSize: 12,
  },
  card: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    gap: 17,
    shadowColor: '#4F3B4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
  },
  sectionIconText: {
    color: '#E75E86',
    fontSize: 25,
    lineHeight: 29,
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: '#292842',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#8D8994',
    fontSize: 12,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#343348',
    fontSize: 13,
    fontWeight: '600',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE8ED',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFCFE',
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    color: '#292842',
    fontSize: 15,
  },
  unit: {
    color: '#777382',
    fontSize: 13,
    marginLeft: 8,
  },
  saveButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#E75E86',
    shadowColor: '#B34E70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  saveMessage: {
    marginTop: -8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
  saveSuccess: {
    color: '#287A5A',
  },
  saveError: {
    color: '#B4233C',
  },
  pressed: {
    opacity: 0.75,
  },
});
