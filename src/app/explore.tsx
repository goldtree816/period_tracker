import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAvatar } from '@/components/profile-avatar';

const cycleProgress = Array.from({ length: 72 }, (_, index) => {
  const angle = (index / 72) * Math.PI * 2 - Math.PI / 2;
  const progress = index / 72;
  const color = progress < 0.29 ? '#F04F78' : progress < 0.44 ? '#6855C8' : '#DEDDE5';

  return {
    left: 110 + Math.cos(angle) * 106 - 4,
    top: 110 + Math.sin(angle) * 106 - 4,
    color,
  };
});

export default function DocsScreen() {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={handleBack}
            style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <ProfileAvatar size={34} />
        </View>

        <View style={styles.cycleSection}>
          <View accessibilityLabel="Cycle day 12 of 28" style={styles.cycleRing}>
            {cycleProgress.map((dot, index) => (
              <View
                key={index}
                style={[
                  styles.ringDot,
                  { left: dot.left, top: dot.top, backgroundColor: dot.color },
                ]}
              />
            ))}
            <View style={styles.cycleCenter}>
              <Text style={styles.flower}>✿</Text>
              <Text style={styles.cycleDay}>Day 12</Text>
              <Text style={styles.cycleLength}>of 28</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextPeriodCard}>
          <View style={styles.nextPeriodIcon}>
            <View style={styles.dropIcon} />
          </View>
          <View style={styles.nextPeriodCopy}>
            <Text style={styles.nextPeriodLabel}>Next period</Text>
            <Text style={styles.nextPeriodValue}>in 5 days</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </View>

        <View style={styles.statsList}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.calendarIconWrap]}>
              <Text style={styles.calendarIcon}>▦</Text>
            </View>
            <Text style={styles.statLabel}>Average cycle length</Text>
            <Text style={styles.statValue}>28 days</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.periodIconWrap]}>
              <View style={styles.smallDropIcon} />
            </View>
            <Text style={styles.statLabel}>Last period</Text>
            <Text style={styles.statValue}>Oct 1, 2026</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.fertileIconWrap]}>
              <View style={styles.leafIcon} />
            </View>
            <Text style={styles.statLabel}>Fertile window</Text>
            <Text style={styles.statValue}>Oct 16 – Oct 20</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCFE',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -16,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F8',
  },
  backButton: {
    width: 32,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    color: '#25243D',
    fontSize: 31,
    lineHeight: 35,
  },
  cycleSection: {
    height: 282,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleRing: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cycleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flower: {
    color: '#F04F78',
    fontSize: 25,
    lineHeight: 30,
    marginBottom: 2,
  },
  cycleDay: {
    color: '#292842',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
  },
  cycleLength: {
    color: '#292842',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  nextPeriodCard: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FCEAF0',
    gap: 14,
  },
  nextPeriodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD4E0',
  },
  dropIcon: {
    width: 15,
    height: 19,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 10,
    backgroundColor: '#F04F78',
    transform: [{ rotate: '45deg' }],
  },
  nextPeriodCopy: {
    flex: 1,
    gap: 2,
  },
  nextPeriodLabel: {
    color: '#B34E70',
    fontSize: 13,
    fontWeight: '500',
  },
  nextPeriodValue: {
    color: '#292842',
    fontSize: 18,
    fontWeight: '700',
  },
  cardArrow: {
    color: '#292842',
    fontSize: 29,
    lineHeight: 34,
  },
  statsList: {
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
    shadowColor: '#4F3B4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIconWrap: {
    backgroundColor: '#FFF0F4',
  },
  calendarIcon: {
    color: '#F04F78',
    fontSize: 21,
    fontWeight: '700',
  },
  periodIconWrap: {
    backgroundColor: '#FFF0F4',
  },
  smallDropIcon: {
    width: 11,
    height: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 8,
    backgroundColor: '#F36C8F',
    transform: [{ rotate: '45deg' }],
  },
  fertileIconWrap: {
    backgroundColor: '#E8F7F1',
  },
  leafIcon: {
    width: 13,
    height: 19,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 12,
    backgroundColor: '#36B88C',
    transform: [{ rotate: '-35deg' }],
  },
  statLabel: {
    flex: 1,
    color: '#343348',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#343348',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
