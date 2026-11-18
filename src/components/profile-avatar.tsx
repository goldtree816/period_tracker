import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfilePhoto } from './profile-photo-context';

type ProfileAvatarProps = {
  size: number;
};

export function ProfileAvatar({ size }: ProfileAvatarProps) {
  const { profilePhoto } = useProfilePhoto();

  return (
    <Link href="/profile" asChild>
      <Pressable
        accessibilityLabel="Open profile"
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <View
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.image} />
          ) : (
            <Text style={[styles.placeholder, { fontSize: size * 0.55 }]}>✿</Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3B6C9',
    backgroundColor: '#FCE6EE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#E75E86',
  },
  pressed: {
    opacity: 0.75,
  },
});
