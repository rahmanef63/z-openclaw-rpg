import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLifeStore } from '@/stores/lifeStore';
import type { LifeAspect } from '@/stores/lifeStore';

describe('lifeStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useLifeStore.setState({
      metricsData: [
        ['personal', { aspect: 'personal', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['career', { aspect: 'career', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['finance', { aspect: 'finance', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['physical', { aspect: 'physical', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['mental', { aspect: 'mental', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['social', { aspect: 'social', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['spiritual', { aspect: 'spiritual', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['intellectual', { aspect: 'intellectual', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['recreation', { aspect: 'recreation', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
        ['environment', { aspect: 'environment', score: 50, lastActivity: null, streak: 0, tasksCompleted: 0, trend: 'stable', weeklyProgress: [50, 50, 50, 50, 50, 50, 50] }],
      ],
      energy: 100,
      focus: 80,
      mood: 70,
      activityLog: [],
      totalPoints: 0,
      dailyStreak: 0,
      lastActiveDate: null,
      achievements: useLifeStore.getState().achievements,
      unlockedAchievements: [],
      presets: [],
      activePreset: null,
    });
  });

  describe('Aspect Metrics', () => {
    it('should update aspect score positively', () => {
      const { updateAspect } = useLifeStore.getState();
      updateAspect('career', 10);
      
      const metric = useLifeStore.getState().getMetric('career');
      expect(metric?.score).toBe(60);
      expect(metric?.trend).toBe('up');
    });

    it('should update aspect score negatively', () => {
      const { updateAspect } = useLifeStore.getState();
      updateAspect('finance', -20);
      
      const metric = useLifeStore.getState().getMetric('finance');
      expect(metric?.score).toBe(30);
      expect(metric?.trend).toBe('down');
    });

    it('should not exceed 100 for aspect score', () => {
      const { updateAspect } = useLifeStore.getState();
      updateAspect('personal', 100);
      
      const metric = useLifeStore.getState().getMetric('personal');
      expect(metric?.score).toBe(100);
    });

    it('should not go below 0 for aspect score', () => {
      const { updateAspect } = useLifeStore.getState();
      updateAspect('physical', -100);
      
      const metric = useLifeStore.getState().getMetric('physical');
      expect(metric?.score).toBe(0);
    });

    it('should set aspect score directly', () => {
      const { setAspectScore } = useLifeStore.getState();
      setAspectScore('mental', 75);
      
      const metric = useLifeStore.getState().getMetric('mental');
      expect(metric?.score).toBe(75);
    });

    it('should update weekly progress when score changes', () => {
      const { updateAspect } = useLifeStore.getState();
      updateAspect('social', 10);
      
      const metric = useLifeStore.getState().getMetric('social');
      const lastProgress = metric?.weeklyProgress[metric.weeklyProgress.length - 1];
      expect(lastProgress).toBe(60);
    });
  });

  describe('Activity Recording', () => {
    it('should record an activity', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Completed a task', 10, undefined, 'tasks');
      
      const { activityLog } = useLifeStore.getState();
      expect(activityLog).toHaveLength(1);
      expect(activityLog[0].action).toBe('Completed a task');
      expect(activityLog[0].points).toBe(10);
    });

    it('should update total points', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task 1', 10);
      recordActivity('finance', 'Task 2', 20);
      
      expect(useLifeStore.getState().totalPoints).toBe(30);
    });

    it('should update tasks completed count', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task 1', 10);
      recordActivity('career', 'Task 2', 10);
      
      const metric = useLifeStore.getState().getMetric('career');
      expect(metric?.tasksCompleted).toBe(2);
    });

    it('should update streak on activity', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task', 10);
      
      const metric = useLifeStore.getState().getMetric('career');
      expect(metric?.streak).toBe(1);
    });

    it('should update last activity timestamp', () => {
      const { recordActivity } = useLifeStore.getState();
      const before = Date.now();
      recordActivity('career', 'Task', 10);
      const after = Date.now();
      
      const metric = useLifeStore.getState().getMetric('career');
      expect(metric?.lastActivity).toBeGreaterThanOrEqual(before);
      expect(metric?.lastActivity).toBeLessThanOrEqual(after);
    });
  });

  describe('Daily Streak', () => {
    it('should start daily streak at 1 for first activity', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'First task', 10);
      
      expect(useLifeStore.getState().dailyStreak).toBe(1);
    });

    it('should increment daily streak on consecutive days', () => {
      // Set last active to yesterday
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      useLifeStore.setState({ lastActiveDate: yesterday, dailyStreak: 1 });
      
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task', 10);
      
      expect(useLifeStore.getState().dailyStreak).toBe(2);
    });

    it('should not increment streak if already active today', () => {
      const today = new Date().toDateString();
      useLifeStore.setState({ lastActiveDate: today, dailyStreak: 5 });
      
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task', 10);
      
      expect(useLifeStore.getState().dailyStreak).toBe(5);
    });

    it('should reset streak if day was skipped', () => {
      // Set last active to 2 days ago
      const twoDaysAgo = new Date(Date.now() - 172800000).toDateString();
      useLifeStore.setState({ lastActiveDate: twoDaysAgo, dailyStreak: 5 });
      
      const { recordActivity } = useLifeStore.getState();
      recordActivity('career', 'Task', 10);
      
      expect(useLifeStore.getState().dailyStreak).toBe(1);
    });
  });

  describe('Energy, Focus, Mood', () => {
    it('should update energy', () => {
      const { updateEnergy } = useLifeStore.getState();
      updateEnergy(-20);
      
      expect(useLifeStore.getState().energy).toBe(80);
    });

    it('should clamp energy between 0 and 100', () => {
      const { updateEnergy } = useLifeStore.getState();
      
      updateEnergy(100);
      expect(useLifeStore.getState().energy).toBe(100);
      
      updateEnergy(-200);
      expect(useLifeStore.getState().energy).toBe(0);
    });

    it('should update focus', () => {
      const { updateFocus } = useLifeStore.getState();
      updateFocus(10);
      
      expect(useLifeStore.getState().focus).toBe(90);
    });

    it('should update mood', () => {
      const { updateMood } = useLifeStore.getState();
      updateMood(-10);
      
      expect(useLifeStore.getState().mood).toBe(60);
    });
  });

  describe('Achievements', () => {
    it('should unlock first-step achievement on first task', () => {
      const { recordActivity } = useLifeStore.getState();
      recordActivity('personal', 'First task', 10);
      
      expect(useLifeStore.getState().unlockedAchievements).toContain('first-step');
    });

    it('should not unlock the same achievement twice', () => {
      const { recordActivity, updateAspect } = useLifeStore.getState();
      
      recordActivity('personal', 'Task 1', 10);
      expect(useLifeStore.getState().unlockedAchievements).toContain('first-step');
      
      // Only the first-step achievement should be unlocked at this point
      // Record another activity - should not add duplicate
      recordActivity('personal', 'Task 2', 10);
      
      // Count occurrences of 'first-step' in unlocked achievements
      const count = useLifeStore.getState().unlockedAchievements.filter(id => id === 'first-step').length;
      expect(count).toBe(1);
    });

    it('should unlock balanced-life when all aspects above 50', () => {
      // Set all aspects to 51
      const metricsData = useLifeStore.getState().metricsData.map(([key, metric]) => [
        key,
        { ...metric, score: 51 }
      ]);
      useLifeStore.setState({ metricsData });
      
      const { checkAchievements } = useLifeStore.getState();
      checkAchievements();
      
      expect(useLifeStore.getState().unlockedAchievements).toContain('balanced-life');
    });
  });

  describe('Presets', () => {
    it('should save a preset', () => {
      const { savePreset } = useLifeStore.getState();
      savePreset('My Room', 'My Room', 'A test room', [
        { assetId: 'main-desk', gridX: 5, gridY: 5, width: 3, height: 2 },
      ]);
      
      expect(useLifeStore.getState().presets).toHaveLength(1);
      expect(useLifeStore.getState().presets[0].name).toBe('My Room');
    });

    it('should load a preset', () => {
      const { savePreset, loadPreset } = useLifeStore.getState();
      
      savePreset('My Room', 'My Room', 'A test room', [
        { assetId: 'main-desk', gridX: 5, gridY: 5, width: 3, height: 2 },
      ]);
      
      const presetId = useLifeStore.getState().presets[0].id;
      const loaded = loadPreset(presetId);
      
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('My Room');
      expect(useLifeStore.getState().activePreset).toBe(presetId);
    });

    it('should delete a preset', () => {
      const { savePreset, deletePreset } = useLifeStore.getState();
      
      savePreset('My Room', 'My Room', 'A test room', []);
      const presetId = useLifeStore.getState().presets[0].id;
      
      deletePreset(presetId);
      expect(useLifeStore.getState().presets).toHaveLength(0);
    });
  });

  describe('Getters', () => {
    it('should get overall score', () => {
      const score = useLifeStore.getState().getOverallScore();
      expect(score).toBe(50); // All aspects at 50
    });

    it('should get recent activities', () => {
      const { recordActivity } = useLifeStore.getState();
      
      for (let i = 0; i < 15; i++) {
        recordActivity('career', `Task ${i}`, 10);
      }
      
      const recent = useLifeStore.getState().getRecentActivities(5);
      expect(recent).toHaveLength(5);
    });

    it('should get metrics as map', () => {
      const map = useLifeStore.getState().getMetricsMap();
      
      expect(map.size).toBe(10);
      expect(map.get('career')?.score).toBe(50);
    });
  });
});
