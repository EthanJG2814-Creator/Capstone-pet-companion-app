import type { Medication, UserPreferences } from '../types';
import { setHours, setMinutes, addMinutes, format } from 'date-fns';

/** Parse frequency string to number of times per day (e.g. "once daily" -> 1) */
export function parseFrequencyToTimesPerDay(frequency: string): number {
  const f = (frequency || '').toLowerCase();
  if (f.includes('once') || f.includes('daily') || f.includes('1x')) return 1;
  if (f.includes('twice') || f.includes('2x') || f.includes('bid')) return 2;
  if (f.includes('three') || f.includes('3x') || f.includes('tid')) return 3;
  if (f.includes('four') || f.includes('4x') || f.includes('qid')) return 4;
  const match = f.match(/(\d+)\s*times?/);
  if (match) return Math.min(parseInt(match[1], 10) || 1, 6);
  return 1;
}

export class SchedulingService {
  static generateReminderSchedule(
    medication: Pick<Medication, 'frequency'>,
    preferences: UserPreferences,
    timesPerDay: number
  ): Date[] {
    const now = new Date();
    const [wakeH, wakeM] = preferences.wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = preferences.sleepTime.split(':').map(Number);
    const times: Date[] = [];
    if (timesPerDay === 1) {
      times.push(setHours(setMinutes(now, wakeM), wakeH));
    } else {
      let awakeMin = (sleepH * 60 + sleepM) - (wakeH * 60 + wakeM);
      if (awakeMin < 0) awakeMin += 24 * 60;
      const step = Math.floor(awakeMin / timesPerDay);
      for (let i = 0; i < timesPerDay; i++) {
        const m = step * i;
        times.push(addMinutes(setHours(setMinutes(now, wakeM), wakeH), m));
      }
    }
    return times;
  }

  static getNextDoseTime(medication: Medication): Date | null {
    const now = new Date();
    const times = Array.isArray(medication.reminderTimes) ? medication.reminderTimes : [];
    const upcomingTimes = times.filter((t) => new Date(t) > now);
    if (upcomingTimes.length > 0) return upcomingTimes[0] instanceof Date ? upcomingTimes[0] : new Date(upcomingTimes[0]);
    if (times.length > 0) {
      const first = times[0];
      const d = first instanceof Date ? first : new Date(first);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return setHours(setMinutes(tomorrow, d.getMinutes()), d.getHours());
    }
    return null;
  }

  static formatTime(date: Date): string {
    return format(date, 'h:mm a');
  }

  static formatTimeList(times: Date[]): string {
    return times.map((t) => this.formatTime(t instanceof Date ? t : new Date(t))).join(', ');
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      wakeTime: '07:00',
      sleepTime: '22:00',
      mealTimes: { breakfast: '08:00', lunch: '12:00', dinner: '18:00' },
      notificationEnabled: true,
      notificationSound: true,
      useRFIDConfirmation: false,
      confirmationWindowMinutes: 30,
    };
  }
}
