/**
 * Task scheduler for replacing cron-style jobs on mobile.
 * Uses setInterval and LocalNotifications to trigger periodic tasks
 * while the application is running.
 */

import { LocalNotifications } from '@capacitor/local-notifications';

export type TaskCallback = () => Promise<void> | void;

class TaskScheduler {
  private tasks: Record<string, any> = {};

  // Schedule a repeating task (interval in milliseconds)
  scheduleInterval(id: string, callback: TaskCallback, interval: number) {
    this.clear(id);
    this.tasks[id] = setInterval(callback, interval);
  }

  // Schedule a one-off task at a specific time
  scheduleTimeout(id: string, callback: TaskCallback, delay: number) {
    this.clear(id);
    this.tasks[id] = setTimeout(() => {
      callback();
      delete this.tasks[id];
    }, delay);
  }

  // Map to local notifications for user visible reminders
  async scheduleLocalNotification(id: number, title: string, body: string, at: Date) {
    await LocalNotifications.schedule({
      notifications: [
        { id, title, body, schedule: { at } }
      ]
    });
  }

  // Clear a scheduled task
  clear(id: string) {
    const handle = this.tasks[id];
    if (handle) {
      clearInterval(handle);
      clearTimeout(handle);
      delete this.tasks[id];
    }
  }

  clearAll() {
    Object.keys(this.tasks).forEach(id => this.clear(id));
  }
}

export const taskScheduler = new TaskScheduler();
export default taskScheduler;
