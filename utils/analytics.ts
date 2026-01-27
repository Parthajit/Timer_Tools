
import { db, auth } from '../lib/firebase';

export interface TimerSession {
  id: string;
  user_id?: string;
  tool: string;
  duration: number; // in milliseconds
  started_at: string;
  metadata?: Record<string, any>;
}

const LOCAL_STORAGE_KEY = 'timetools_sessions';

// Helper to retrieve local sessions from storage
const getLocalSessions = (): TimerSession[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// Save locally if offline or not logged in
const saveLocally = (data: Omit<TimerSession, 'id'>) => {
  try {
    const sessions = getLocalSessions();
    sessions.push({
      ...data,
      id: crypto.randomUUID()
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save session locally", e);
  }
};

export const logSession = async (
  tool: string, 
  duration: number, 
  metadata?: Record<string, any>
) => {
  if (duration < 1000) return;

  const user = auth.currentUser;
  const sessionData = {
    tool,
    duration,
    started_at: new Date().toISOString(),
    metadata: metadata || {}
  };

  if (user) {
      try {
          // Fix: Use compat style for collection and add
          await db.collection('timer_sessions').add({
              ...sessionData,
              user_id: user.uid,
          });
      } catch (e: any) {
          console.warn("Storage permission denied or network error. Saving locally.", e.message);
          saveLocally(sessionData);
      }
  } else {
      saveLocally(sessionData);
  }
};

export const getSessions = async (): Promise<TimerSession[]> => {
  const user = auth.currentUser;

  if (user) {
      try {
          // Fix: Use compat style for query
          const querySnapshot = await db.collection('timer_sessions')
            .where('user_id', '==', user.uid)
            .get();
          
          const sessions: TimerSession[] = [];
          querySnapshot.forEach((doc) => {
              sessions.push({ id: doc.id, ...doc.data() } as TimerSession);
          });
          
          const local = getLocalSessions();
          return [...sessions, ...local].sort((a, b) => 
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          );
      } catch (e: any) {
          console.warn("Analytics fetch failed. Fallback to local cache.", e.message);
          return getLocalSessions().sort((a, b) => 
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          );
      }
  } else {
      return getLocalSessions().sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
  }
};

export const generateMockData = () => {
  const existing = getLocalSessions();
  if (existing.length > 0) return;

  const tools = ['stopwatch', 'countdown', 'interval', 'laptimer'];
  const mockSessions: TimerSession[] = [];
  const now = new Date();

  for (let i = 0; i < 70; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const tool = tools[Math.floor(Math.random() * tools.length)];
    let metadata: any = {};
    let duration = Math.floor(Math.random() * 1000 * 60 * 45) + 5000;

    if (tool === 'interval') {
        metadata = { rounds: 8, work: 20000, rest: 10000, rounds_completed: Math.floor(Math.random() * 8) + 1 };
    } else if (tool === 'countdown') {
        metadata = { 
          original_target: 300000, 
          completed: Math.random() > 0.4,
          pauses: Math.floor(Math.random() * 5)
        };
    } else if (tool === 'laptimer') {
        const lapCount = Math.floor(Math.random() * 10) + 1;
        const avg = Math.floor(Math.random() * 50000) + 20000;
        const variance = Math.floor(Math.random() * 2000000);
        metadata = {
            lapCount,
            averageLap: avg,
            consistency: Math.sqrt(variance),
            fastestLap: avg - 5000,
            slowestLap: avg + 5000
        }
        duration = lapCount * avg;
    }

    mockSessions.push({
      id: crypto.randomUUID(),
      tool: tool,
      duration: duration,
      started_at: date.toISOString(),
      metadata
    });
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockSessions));
};
