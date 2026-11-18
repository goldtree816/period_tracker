import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CYCLE_START_DATE = new Date(2026, 9, 1);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MOODS = [
  { label: 'Happy', emoji: '😃', color: '#FFC65C' },
  { label: 'Okay', emoji: '😐', color: '#9296F4' },
  { label: 'Sad', emoji: '😢', color: '#80B6F4' },
  { label: 'Stressed', emoji: '😣', color: '#F47C9C' },
];
const SYMPTOMS = [
  { label: 'Cramps', emoji: '🌸' },
  { label: 'Headache', emoji: '🧠' },
  { label: 'Backache', emoji: '💪' },
  { label: 'Breast tenderness', emoji: '💗' },
  { label: 'Bloating', emoji: '🍃' },
];

type CalendarDay = {
  date: number;
  fullDate: Date;
  type: 'period' | 'fertile' | 'ovulation' | 'normal';
};

type CycleMarker = Exclude<CalendarDay['type'], 'normal'>;

const CYCLE_MARKERS: { type: CycleMarker; label: string; color: string }[] = [
  { type: 'period', label: 'Period days', color: '#F56891' },
  { type: 'fertile', label: 'Fertile window', color: '#58CFB8' },
  { type: 'ovulation', label: 'Ovulation day', color: '#6557D9' },
];

function getDayNumber(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function addCalendarMonth(date: Date) {
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const lastDayOfNextMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    Math.min(date.getDate(), lastDayOfNextMonth),
  );
}

function getLatestPeriodStart(markedDays: Record<string, CalendarDay['type']>) {
  const periodDates = Object.entries(markedDays)
    .filter(([, type]) => type === 'period')
    .map(([key]) => {
      const [year, month, date] = key.split('-').map(Number);
      return new Date(year, month, date);
    })
    .sort((first, second) => getDayNumber(first) - getDayNumber(second));

  if (periodDates.length === 0) {
    return CYCLE_START_DATE;
  }

  let latestStart = periodDates[0];
  for (let index = 1; index < periodDates.length; index += 1) {
    if (getDayNumber(periodDates[index]) - getDayNumber(periodDates[index - 1]) !== 1) {
      latestStart = periodDates[index];
    }
  }

  return latestStart;
}

function getCalendarDays(year: number, month: number): (CalendarDay | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (CalendarDay | null)[] = Array.from({ length: firstWeekday }, () => null);

  for (let date = 1; date <= daysInMonth; date += 1) {
    const fullDate = new Date(year, month, date);
    days.push({ date, fullDate, type: 'normal' });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatMonth(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [activeMarker, setActiveMarker] = useState<CycleMarker | null>(null);
  const [markedDays, setMarkedDays] = useState<Record<string, CalendarDay['type']>>({});
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = getCalendarDays(year, month);
  const today = new Date();
  const todayDayNumber = getDayNumber(today);
  let nextPeriodDate = addCalendarMonth(getLatestPeriodStart(markedDays));
  while (getDayNumber(nextPeriodDate) < todayDayNumber) {
    nextPeriodDate = addCalendarMonth(nextPeriodDate);
  }
  const daysUntilNextPeriod = getDayNumber(nextPeriodDate) - todayDayNumber;

  function changeMonth(offset: number) {
    setVisibleMonth((currentMonth) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
    setSelectedDate((currentDate) => {
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + offset,
        1,
      );
      const daysInNextMonth = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        0,
      ).getDate();
      return new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        Math.min(currentDate.getDate(), daysInNextMonth),
      );
    });
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    changeMonth(-1);
  }

  function openNextPeriod() {
    setVisibleMonth(new Date(nextPeriodDate.getFullYear(), nextPeriodDate.getMonth(), 1));
    setSelectedDate(nextPeriodDate);
  }

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((currentSymptoms) =>
      currentSymptoms.includes(symptom)
        ? currentSymptoms.filter((currentSymptom) => currentSymptom !== symptom)
        : [...currentSymptoms, symptom],
    );
    setCheckInSaved(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={handleBack}
            hitSlop={10}
            style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.monthHeader}>
          <Pressable
            accessibilityLabel="Previous month"
            accessibilityRole="button"
            onPress={() => changeMonth(-1)}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}>
            <Text style={styles.monthArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{formatMonth(year, month)}</Text>
          <Pressable
            accessibilityLabel="Next month"
            accessibilityRole="button"
            onPress={() => changeMonth(1)}
            style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}>
            <Text style={styles.monthArrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendar}>
          <View style={styles.weekdays}>
            {WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const isSelected =
                day?.fullDate.getFullYear() === selectedDate.getFullYear() &&
                day?.fullDate.getMonth() === selectedDate.getMonth() &&
                day?.fullDate.getDate() === selectedDate.getDate();
              const dayType = day ? markedDays[getDateKey(day.fullDate)] ?? day.type : 'normal';
              return (
                <View key={`${year}-${month}-${index}`} style={styles.dayCell}>
                  {day ? (
                    <Pressable
                      accessibilityLabel={day.fullDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        setSelectedDate(day.fullDate);
                        if (activeMarker) {
                          const dateKey = getDateKey(day.fullDate);
                          setMarkedDays((currentMarks) => ({
                            ...currentMarks,
                            [dateKey]: dayType === activeMarker ? 'normal' : activeMarker,
                          }));
                        }
                      }}
                      style={[
                        styles.dayButton,
                        dayType === 'period' && styles.periodDay,
                        dayType === 'fertile' && styles.fertileDay,
                        dayType === 'ovulation' && styles.ovulationDay,
                        isSelected && styles.selectedDay,
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          dayType !== 'normal' && styles.markedDayText,
                        ]}>
                        {day.date}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          {CYCLE_MARKERS.map((marker) => {
            const isActive = activeMarker === marker.type;
            return (
              <Pressable
                key={marker.type}
                accessibilityLabel={`Mark ${marker.label.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveMarker(isActive ? null : marker.type)}
                style={({ pressed }) => [
                  styles.legendItem,
                  isActive && [
                    styles.selectedLegendItem,
                    { borderColor: marker.color, backgroundColor: `${marker.color}18` },
                  ],
                  pressed && styles.cardPressed,
                ]}>
                <View style={[styles.legendDot, { backgroundColor: marker.color }]} />
                <Text style={[styles.legendText, isActive && styles.selectedLegendText]}>
                  {marker.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.markingHint}>
          {activeMarker
            ? `Tap dates to mark them as ${CYCLE_MARKERS.find((marker) => marker.type === activeMarker)?.label.toLowerCase()}. Tap the option again to finish.`
            : 'Choose a type, then tap dates to mark them.'}
        </Text>

        <Pressable
          accessibilityLabel={`Next period in ${daysUntilNextPeriod} days`}
          accessibilityRole="button"
          onPress={openNextPeriod}
          style={({ pressed }) => [styles.nextPeriodCard, pressed && styles.cardPressed]}>
          <View style={styles.calendarIconWrap}>
            <Text style={styles.calendarIcon}>▦</Text>
          </View>
          <View style={styles.nextPeriodCopy}>
            <Text style={styles.nextPeriodLabel}>Next period in</Text>
            <Text style={styles.nextPeriodValue}>
              {daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'day' : 'days'}
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </Pressable>

        <View style={styles.checkInCard}>
          <Text style={styles.checkInTitle}>How are you feeling?</Text>
          <Text style={styles.checkInSubtitle}>Select your mood and symptoms</Text>

          <View style={styles.moodRow}>
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.label;
              return (
                <Pressable
                  key={mood.label}
                  accessibilityLabel={mood.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setSelectedMood(mood.label);
                    setCheckInSaved(false);
                  }}
                  style={({ pressed }) => [
                    styles.moodOption,
                    pressed && styles.cardPressed,
                  ]}>
                  <View
                    style={[
                      styles.moodFace,
                      { backgroundColor: mood.color },
                      isSelected && styles.selectedMoodFace,
                    ]}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </View>
                  <Text style={[styles.moodLabel, isSelected && styles.selectedMoodLabel]}>
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.symptomsTitle}>Common Symptoms (optional)</Text>
          <View style={styles.symptomsList}>
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.label);
              return (
                <Pressable
                  key={symptom.label}
                  accessibilityLabel={symptom.label}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => toggleSymptom(symptom.label)}
                  style={({ pressed }) => [
                    styles.symptomRow,
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={styles.symptomIcon}>
                    <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                  </View>
                  <Text style={styles.symptomLabel}>{symptom.label}</Text>
                  <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel={checkInSaved ? 'Check-in saved' : 'Save check-in'}
            accessibilityRole="button"
            onPress={() => setCheckInSaved(true)}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}>
            <Text style={styles.saveButtonText}>{checkInSaved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  header: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    fontSize: 30,
    lineHeight: 34,
    color: '#22223D',
  },
  backButton: {
    width: 32,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#22223D',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
  },
  monthHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },
  monthArrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowPressed: {
    opacity: 0.55,
  },
  monthArrowText: {
    color: '#292944',
    fontSize: 27,
    lineHeight: 31,
  },
  monthTitle: {
    color: '#252541',
    fontSize: 15,
    fontWeight: '700',
  },
  calendar: {
    marginTop: 1,
  },
  weekdays: {
    flexDirection: 'row',
    height: 28,
    alignItems: 'center',
  },
  weekday: {
    width: `${100 / 7}%`,
    color: '#45455A',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodDay: {
    backgroundColor: '#F56891',
  },
  fertileDay: {
    backgroundColor: '#58CFB8',
  },
  ovulationDay: {
    backgroundColor: '#6557D9',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: '#403B87',
  },
  selectedNormalDay: {
    backgroundColor: '#EEE8FB',
  },
  cardPressed: {
    opacity: 0.72,
  },
  dayText: {
    color: '#292944',
    fontSize: 11,
    fontWeight: '500',
  },
  markedDayText: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 8,
    marginTop: 13,
    paddingBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 14,
  },
  selectedLegendItem: {
    borderWidth: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#34344B',
    fontSize: 10,
    fontWeight: '500',
  },
  selectedLegendText: {
    color: '#252541',
    fontWeight: '700',
  },
  markingHint: {
    marginTop: -8,
    marginBottom: 12,
    color: '#777287',
    fontSize: 10,
  },
  nextPeriodCard: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F7F1FC',
    gap: 11,
  },
  calendarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBD9FF',
  },
  calendarIcon: {
    color: '#8743D5',
    fontSize: 23,
    fontWeight: '700',
  },
  nextPeriodCopy: {
    flex: 1,
    gap: 1,
  },
  nextPeriodLabel: {
    color: '#39364E',
    fontSize: 11,
    fontWeight: '500',
  },
  nextPeriodValue: {
    color: '#312272',
    fontSize: 17,
    fontWeight: '700',
  },
  cardArrow: {
    color: '#30216E',
    fontSize: 28,
    lineHeight: 32,
  },
  checkInCard: {
    marginTop: 16,
    marginBottom: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF5FA',
  },
  checkInTitle: {
    color: '#25243D',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkInSubtitle: {
    marginTop: 3,
    color: '#777287',
    fontSize: 11,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 14,
  },
  moodOption: {
    minWidth: 54,
    alignItems: 'center',
    gap: 4,
  },
  moodFace: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMoodFace: {
    borderWidth: 2,
    borderColor: '#D73B71',
  },
  moodEmoji: {
    fontSize: 19,
  },
  moodLabel: {
    color: '#4A485D',
    fontSize: 10,
    fontWeight: '500',
  },
  selectedMoodLabel: {
    color: '#C72F66',
    fontWeight: '700',
  },
  symptomsTitle: {
    marginBottom: 7,
    color: '#37354B',
    fontSize: 12,
    fontWeight: '700',
  },
  symptomsList: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  symptomRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  symptomIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
  },
  symptomEmoji: {
    fontSize: 12,
  },
  symptomLabel: {
    flex: 1,
    color: '#37354B',
    fontSize: 11,
    fontWeight: '500',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: '#C7C4D2',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    borderColor: '#D73B71',
    backgroundColor: '#D73B71',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  saveButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: '#D73B71',
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
