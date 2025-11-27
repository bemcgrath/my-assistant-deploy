import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { User, Heart, DollarSign, BookOpen, Home, MessageCircle, Target, Bell, Settings, ChevronRight, Plus, Send, Calendar, Mail, TrendingUp, Clock, CheckCircle2, Circle, ArrowLeft, X, Edit3, Check, Trash2, Sparkles, AlertCircle, ChevronDown, ChevronUp, Inbox, Users, FileText, Mic, Paperclip, MoreHorizontal, RefreshCw, Star, Archive, Reply, Forward, ExternalLink, Save, Cloud, CloudOff, Loader2, Droplets, Moon, Activity, Apple, Scale, Download, Upload } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ============================================
// DATA PERSISTENCE LAYER
// ============================================

// Custom hook for persistent state with localStorage
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(`myassistant_${key}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
    }
    return defaultValue;
  });

  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(`myassistant_${key}`, JSON.stringify(state));
      setLastSaved(new Date());
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  }, [key, state]);

  return [state, setState, lastSaved];
};

// App-wide data context
const AppDataContext = createContext(null);

const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

// Data provider component
const AppDataProvider = ({ children }) => {
  // User profile and preferences
  const [userProfile, setUserProfile, profileSaved] = usePersistentState('userProfile', {
    name: '',
    email: '',
    onboardingComplete: false,
  });

  // Personal Assistant data
  const [personalAssistantData, setPersonalAssistantData, paSaved] = usePersistentState('personalAssistant', {
    preferences: {
      tone: 'professional',
      autoDraft: true,
      priorityAlerts: true,
      traits: [
        'Starts with greeting',
        'Uses bullet points for lists',
        'Ends with clear next steps',
        'Keeps emails concise',
      ]
    },
    goals: [
      { id: 1, title: 'Inbox Zero', description: 'Clear all emails by end of day', progress: 65, completed: false },
      { id: 2, title: 'Respond to priority contacts within 2 hours', description: '12 priority contacts configured', progress: 80, completed: false },
    ],
    reminders: [
      { id: 1, text: 'Team meeting in 30 minutes', time: '10:00 AM', urgent: true },
      { id: 2, text: 'Follow up with Sarah about project proposal', time: '2:00 PM', urgent: false },
      { id: 3, text: 'Review and send weekly report', time: '4:00 PM', urgent: false },
    ],
    drafts: [
      {
        id: 1,
        to: 'Sarah Chen',
        subject: 'Re: Q4 Budget Review',
        body: `Hi Sarah,\n\nThanks for sending over the Q4 budget details. I've reviewed the numbers and have a few thoughts:\n\n• The marketing allocation looks good\n• We might want to revisit the software licenses line item\n• Happy to discuss the contingency fund in our next meeting\n\nLet me know when you're free to chat.\n\nBest,`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        to: 'Mike Johnson',
        subject: 'Project Timeline Update',
        body: `Hi Mike,\n\nFollowing up on yesterday's discussion about the project timeline.\n\nI've adjusted the milestones as we discussed. The new target for Phase 1 completion is March 15th, which gives us a 2-week buffer.\n\nI'll send the updated Gantt chart by EOD.\n\nThanks,`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ],
    chatHistory: [],
    priorityContacts: ['Sarah Chen', 'Mike Johnson', 'Alex Rivera'],
  });

  // Health Coach data
  const [healthCoachData, setHealthCoachData, healthSaved] = usePersistentState('healthCoach', {
    goals: [
      { id: 1, title: 'Sleep 8 hours nightly', description: 'Track your sleep', progress: 0, completed: false, autoTracked: true, trackingType: 'sleep', target: 8 },
      { id: 2, title: 'Drink 8 glasses of water daily', description: 'Stay hydrated', progress: 0, completed: false, autoTracked: true, trackingType: 'water', target: 8 },
      { id: 3, title: 'Exercise 30 minutes daily', description: 'Stay active', progress: 0, completed: false, autoTracked: true, trackingType: 'exercise', target: 30 },
    ],
    reminders: [],
    chatHistory: [],
    dailyLogs: {},
    enabledMetrics: {
      water: true,
      sleep: true,
      exercise: true,
      meal: true,
      weight: false,
    },
    targets: {
      water: 8,
      sleep: 8,
      exercise: 30,
      meal: 3,
      weight: 150,
    },
  });

  // Financial Advisor data
  const [financialData, setFinancialData, financeSaved] = usePersistentState('financialAdvisor', {
    goals: [
      { id: 1, title: 'Emergency Fund', description: 'Target: $10,000', progress: 72, completed: false },
      { id: 2, title: 'Retirement Contribution', description: 'Max out 401k this year', progress: 45, completed: false },
    ],
    riskProfile: 'moderate',
    reminders: [],
    chatHistory: [],
  });

  // Learning Tutor data
  const [learningData, setLearningData, learningSaved] = usePersistentState('learningTutor', {
    goals: [
      { id: 1, title: 'Complete Python Basics', description: 'Module 3 of 5', progress: 60, completed: false },
      { id: 2, title: 'Read 2 books/month', description: 'Current: None selected', progress: 0, completed: false },
    ],
    curriculums: [],
    reminders: [],
    chatHistory: [],
    studyStreak: 0,
  });

  // Sync status
  const [syncStatus, setSyncStatus] = useState('saved');

  // Helper to update nested data
  const updatePersonalAssistant = useCallback((updater) => {
    setPersonalAssistantData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
    setSyncStatus('saving');
    setTimeout(() => setSyncStatus('saved'), 500);
  }, [setPersonalAssistantData]);

  const updateHealthCoach = useCallback((updater) => {
    setHealthCoachData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
    setSyncStatus('saving');
    setTimeout(() => setSyncStatus('saved'), 500);
  }, [setHealthCoachData]);

  const updateFinancial = useCallback((updater) => {
    setFinancialData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
    setSyncStatus('saving');
    setTimeout(() => setSyncStatus('saved'), 500);
  }, [setFinancialData]);

  const updateLearning = useCallback((updater) => {
    setLearningData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
    setSyncStatus('saving');
    setTimeout(() => setSyncStatus('saved'), 500);
  }, [setLearningData]);

  // Clear all data (for testing/reset)
  const clearAllData = useCallback(() => {
    const keys = ['userProfile', 'personalAssistant', 'healthCoach', 'financialAdvisor', 'learningTutor', 'googleAuth'];
    keys.forEach(key => localStorage.removeItem(`myassistant_${key}`));
    window.location.reload();
  }, []);

  // Google Auth state
  const [googleAuth, setGoogleAuth, googleAuthSaved] = usePersistentState('googleAuth', null);
  
  // Check for auth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');
    const authError = params.get('auth_error');
    
    if (authSuccess) {
      try {
        const authData = JSON.parse(atob(authSuccess));
        setGoogleAuth(authData);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to parse auth data:', e);
      }
    }
    
    if (authError) {
      console.error('Auth error:', authError);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  // Google API helper functions
  const googleLogin = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);
  
  const googleLogout = useCallback(() => {
    setGoogleAuth(null);
  }, [setGoogleAuth]);
  
  // Refresh token if needed
  const getValidAccessToken = useCallback(async () => {
    if (!googleAuth) return null;
    
    // Check if token is expired (with 5 min buffer)
    if (googleAuth.expires_at && Date.now() > googleAuth.expires_at - 300000) {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: googleAuth.refresh_token }),
        });
        
        if (response.ok) {
          const newTokens = await response.json();
          setGoogleAuth(prev => ({
            ...prev,
            access_token: newTokens.access_token,
            expires_at: newTokens.expires_at,
          }));
          return newTokens.access_token;
        } else {
          // Refresh failed, user needs to re-login
          setGoogleAuth(null);
          return null;
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
        return null;
      }
    }
    
    return googleAuth.access_token;
  }, [googleAuth, setGoogleAuth]);
  
  // Fetch calendar events
  const fetchCalendarEvents = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) return { events: [], error: 'Not authenticated' };
    
    try {
      const response = await fetch('/api/google/calendar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { events: [], error: error.error || 'Failed to fetch calendar' };
      }
      
      return await response.json();
    } catch (e) {
      console.error('Calendar fetch error:', e);
      return { events: [], error: 'Network error' };
    }
  }, [getValidAccessToken]);
  
  // Fetch emails
  const fetchEmails = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) return { emails: [], error: 'Not authenticated' };
    
    try {
      const response = await fetch('/api/google/emails', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { emails: [], error: error.error || 'Failed to fetch emails' };
      }
      
      return await response.json();
    } catch (e) {
      console.error('Email fetch error:', e);
      return { emails: [], error: 'Network error' };
    }
  }, [getValidAccessToken]);
  
  // Send email
  const sendEmail = useCallback(async (to, subject, body, threadId = null) => {
    const token = await getValidAccessToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await fetch('/api/google/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body, threadId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to send email' };
      }
      
      return await response.json();
    } catch (e) {
      console.error('Email send error:', e);
      return { success: false, error: 'Network error' };
    }
  }, [getValidAccessToken]);
  
  // Fetch single email by ID
  const fetchEmailById = useCallback(async (emailId) => {
    const token = await getValidAccessToken();
    if (!token) return { email: null, error: 'Not authenticated' };
    
    try {
      const response = await fetch(`/api/google/email/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { email: null, error: error.error || 'Failed to fetch email' };
      }
      
      return await response.json();
    } catch (e) {
      console.error('Email fetch error:', e);
      return { email: null, error: 'Network error' };
    }
  }, [getValidAccessToken]);

  const value = {
    // User profile
    userProfile,
    setUserProfile,
    
    // Agent data
    personalAssistant: personalAssistantData,
    updatePersonalAssistant,
    
    healthCoach: healthCoachData,
    updateHealthCoach,
    
    financial: financialData,
    updateFinancial,
    
    learning: learningData,
    updateLearning,
    
    // Google Auth
    googleAuth,
    googleLogin,
    googleLogout,
    fetchCalendarEvents,
    fetchEmails,
    fetchEmailById,
    sendEmail,
    
    // Utilities
    syncStatus,
    clearAllData,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

// Sync status indicator component
const SyncIndicator = () => {
  const { syncStatus } = useAppData();
  
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      {syncStatus === 'saving' ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Cloud className="w-3 h-3" />
          <span>Saved</span>
        </>
      )}
    </div>
  );
};

// ============================================
// REUSABLE MODAL COMPONENTS
// ============================================

// Base Modal wrapper
const Modal = ({ isOpen, onClose, title, children }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 id="modal-title" className="font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Edit Goal Modal
const EditGoalModal = ({ isOpen, onClose, goal, onSave, onDelete }) => {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Reset form when goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setShowDeleteConfirm(false);
    }
  }, [goal]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      ...goal,
      title: title.trim(),
      description: description.trim(),
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(goal.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  if (!goal) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Goal">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        {/* Progress display (read-only) */}
        {goal.progress !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Current progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              {goal.autoTracked && (
                <p className="text-xs text-gray-400 mt-2">This goal is automatically tracked based on your logs</p>
              )}
            </div>
          </div>
        )}
        
        {/* Delete section */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${
              showDeleteConfirm 
                ? 'bg-red-500 text-white' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {showDeleteConfirm ? 'Tap again to confirm delete' : 'Delete Goal'}
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

// Add Goal Modal
const AddGoalModal = ({ isOpen, onClose, onAdd, agentType = 'personal' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasTarget, setHasTarget] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  
  // Suggestions based on agent type
  const suggestions = {
    personal: [
      'Inbox Zero daily',
      'Respond to emails within 2 hours',
      'Block 2 hours focus time daily',
      'Review calendar every morning',
      'Limit meetings to 4 hours/day',
    ],
    health: [
      'Sleep 8 hours nightly',
      'Drink 8 glasses of water daily',
      'Exercise 30 minutes daily',
      'Log all meals',
      'Take 10,000 steps daily',
      'Meditate 10 minutes daily',
    ],
    financial: [
      'Save $500/month',
      'Build emergency fund',
      'Max out 401k contribution',
      'Pay off credit card',
      'Track all expenses',
      'Review budget weekly',
    ],
    learning: [
      'Study 1 hour daily',
      'Complete online course',
      'Read 2 books/month',
      'Practice new skill daily',
      'Take notes on learnings',
    ],
  };
  
  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const newGoal = {
      id: Date.now(),
      title: title.trim().slice(0, 100), // Limit title length
      description: description.trim().slice(0, 200) || (hasTarget ? `Target: ${targetValue} ${targetUnit}` : ''),
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      ...(hasTarget && { target: { value: parseInt(targetValue) || 0, unit: targetUnit, current: 0 } }),
    };
    
    onAdd(newGoal);
    
    // Reset form
    setTitle('');
    setDescription('');
    setHasTarget(false);
    setTargetValue('');
    setTargetUnit('');
    onClose();
  };
  
  const handleSuggestionClick = (suggestion) => {
    setTitle(suggestion);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Goal">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="What do you want to achieve?"
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {(suggestions[agentType] || suggestions.personal).slice(0, 5).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  title === suggestion 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about this goal..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTarget}
              onChange={(e) => setHasTarget(e.target.checked)}
              className="w-5 h-5 rounded text-blue-500"
            />
            <span className="text-sm text-gray-700">Set a measurable target</span>
          </label>
          
          {hasTarget && (
            <div className="flex gap-3 mt-3">
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Target"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="Unit (hours, glasses, etc.)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Add Goal
        </button>
      </div>
    </Modal>
  );
};

// Add Reminder Modal
const AddReminderModal = ({ isOpen, onClose, onAdd }) => {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [customTime, setCustomTime] = useState('');
  
  const timeOptions = [
    { id: 'in_30_min', label: 'In 30 minutes' },
    { id: 'in_1_hour', label: 'In 1 hour' },
    { id: 'in_2_hours', label: 'In 2 hours' },
    { id: 'tomorrow_9am', label: 'Tomorrow 9 AM' },
    { id: 'custom', label: 'Custom time' },
  ];
  
  const getTimeLabel = (timeId) => {
    const now = new Date();
    switch (timeId) {
      case 'in_30_min':
        now.setMinutes(now.getMinutes() + 30);
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      case 'in_1_hour':
        now.setHours(now.getHours() + 1);
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      case 'in_2_hours':
        now.setHours(now.getHours() + 2);
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      case 'tomorrow_9am':
        return 'Tomorrow 9:00 AM';
      case 'custom':
        return customTime || 'Set time';
      default:
        return '';
    }
  };
  
  const handleSubmit = () => {
    if (!text.trim() || !time) return;
    
    const newReminder = {
      id: Date.now(),
      text: text.trim().slice(0, 150),
      time: getTimeLabel(time),
      urgent: isUrgent,
      createdAt: new Date().toISOString(),
    };
    
    onAdd(newReminder);
    
    // Reset form
    setText('');
    setTime('');
    setIsUrgent(false);
    setCustomTime('');
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Reminder">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to be reminded about?</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Follow up with Sarah"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">When?</label>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setTime(option.id)}
                className={`px-4 py-3 text-sm rounded-xl border-2 transition-all text-left ${
                  time === option.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {time === 'custom' && (
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
        
        <div>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-5 h-5 rounded text-red-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Mark as urgent</span>
              <p className="text-xs text-gray-500">Urgent reminders are highlighted</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!text.trim() || !time}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Add Reminder
        </button>
      </div>
    </Modal>
  );
};

// Empty State component
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
  };
  
  return (
    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
      <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-80`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${colorClasses[color]} text-white text-sm font-medium rounded-lg hover:opacity-90`}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-pulse`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ============================================
// ONBOARDING FLOW
// ============================================

const OnboardingFlow = ({ onComplete }) => {
  const { userProfile, setUserProfile, updatePersonalAssistant, personalAssistant } = useAppData();
  const [step, setStep] = useState(0);
  
  // Local state for onboarding data
  const [name, setName] = useState(userProfile.name || '');
  const [selectedAgents, setSelectedAgents] = useState({
    personal: true,
    health: false,
    financial: false,
    learning: false,
  });
  const [tone, setTone] = useState('professional');
  const [firstGoal, setFirstGoal] = useState('');
  const [priorityContacts, setPriorityContacts] = useState('');
  
  const totalSteps = 5;
  
  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = () => {
    // Save user profile
    setUserProfile({
      name,
      email: userProfile.email,
      onboardingComplete: true,
    });
    
    // Save Personal Assistant preferences
    updatePersonalAssistant(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        tone,
      },
      goals: firstGoal ? [
        { 
          id: Date.now(), 
          title: firstGoal, 
          description: 'Added during setup', 
          progress: 0, 
          completed: false 
        },
        ...prev.goals.filter(g => g.title !== firstGoal)
      ] : prev.goals,
      priorityContacts: priorityContacts 
        ? priorityContacts.split(',').map(c => c.trim()).filter(Boolean)
        : prev.priorityContacts,
      // Clear sample drafts for fresh start
      drafts: [],
      chatHistory: [],
    }));
    
    onComplete();
  };
  
  const agents = [
    { 
      id: 'personal', 
      name: 'Personal Assistant', 
      icon: User, 
      color: 'from-blue-500 to-indigo-500',
      description: 'Manages your email, calendar, and communications. Learns your tone and drafts messages for you.',
      available: true,
    },
    { 
      id: 'health', 
      name: 'Health Coach', 
      icon: Heart, 
      color: 'from-emerald-500 to-teal-500',
      description: 'Tracks sleep, hydration, and nutrition. Sends reminders and finds wellness content for you.',
      available: false,
    },
    { 
      id: 'financial', 
      name: 'Financial Advisor', 
      icon: DollarSign, 
      color: 'from-amber-500 to-orange-500',
      description: 'Helps you set and track financial goals. Monitors your progress and finds relevant insights.',
      available: false,
    },
    { 
      id: 'learning', 
      name: 'Learning Tutor', 
      icon: BookOpen, 
      color: 'from-purple-500 to-pink-500',
      description: 'Creates personalized curriculums. Teaches you interactively and tracks your learning journey.',
      available: false,
    },
  ];
  
  const toneOptions = [
    { id: 'professional', label: 'Professional', desc: 'Formal but approachable. Great for work communications.', emoji: '💼' },
    { id: 'casual', label: 'Casual', desc: 'Friendly and relaxed. Perfect for everyday conversations.', emoji: '😊' },
    { id: 'formal', label: 'Formal', desc: 'Traditional business style. Best for executive communications.', emoji: '🎩' },
  ];
  
  const goalSuggestions = [
    'Inbox Zero by end of each day',
    'Respond to emails within 2 hours',
    'Block focus time daily',
    'Review calendar every morning',
    'Limit meetings to 4 hours/day',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {step + 1} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to My Assistant</h1>
                <p className="text-gray-500">Your personal AI-powered productivity hub. Let's get you set up in just a few steps.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What should I call you?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                </div>
              </div>
              
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full mt-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started
              </button>
            </div>
          )}
          
          {/* Step 1: Meet Your Assistants */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Meet Your Assistants</h2>
                <p className="text-gray-500">Choose which AI assistants you'd like to activate. You can always change this later.</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => agent.available && setSelectedAgents(prev => ({ ...prev, [agent.id]: !prev[agent.id] }))}
                    disabled={!agent.available}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAgents[agent.id] 
                        ? 'border-blue-500 bg-blue-50' 
                        : agent.available 
                          ? 'border-gray-100 hover:border-gray-200' 
                          : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center flex-shrink-0`}>
                        <agent.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          {agent.available ? (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAgents[agent.id] ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {selectedAgents[agent.id] && <Check className="w-3 h-3 text-white" />}
                            </div>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Personal Assistant Setup */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Personal Assistant Setup</h2>
                <p className="text-gray-500">Help me understand your communication style.</p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How should I write emails for you?</label>
                  <div className="space-y-2">
                    {toneOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setTone(option.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          tone === option.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900">{option.label}</p>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: First Goal */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Set Your First Goal</h2>
                <p className="text-gray-500">What would you like to accomplish? Pick one or write your own.</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    value={firstGoal}
                    onChange={(e) => setFirstGoal(e.target.value)}
                    placeholder="Enter a goal..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Or choose a suggestion:</p>
                  <div className="flex flex-wrap gap-2">
                    {goalSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setFirstGoal(suggestion)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          firstGoal === suggestion 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  {firstGoal ? 'Continue' : 'Skip for Now'}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Ready */}
          {step === 4 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set, {name}!</h2>
                <p className="text-gray-500">Your Personal Assistant is ready to help you be more productive.</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <h3 className="font-medium text-gray-900 mb-3">Here's what's set up:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Communication style: <strong className="capitalize">{tone}</strong></span>
                  </li>
                  {firstGoal && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>First goal: <strong>{firstGoal}</strong></span>
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Personal Assistant: <strong>Active</strong></span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-8">
                <h3 className="font-medium text-blue-900 mb-2">💡 Quick Tip</h3>
                <p className="text-sm text-blue-700">Try chatting with your Personal Assistant! Ask about your schedule, have it draft an email, or set a reminder.</p>
              </div>
              
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Go to My Dashboard
              </button>
            </div>
          )}
        </div>
        
        {/* Skip option */}
        {step < totalSteps - 1 && (
          <button
            onClick={handleComplete}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Skip setup and start with defaults
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// SHARED COMPONENTS (Used across all agents)
// ============================================

const GoalCard = ({ goal, onToggle, onEdit }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-start gap-3">
      <button onClick={() => onToggle?.(goal.id)} className="mt-1 transition-transform hover:scale-110 flex-shrink-0">
        {goal.completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 hover:text-blue-400" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium break-words ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{goal.title}</h4>
          {onEdit && (
            <button 
              onClick={() => onEdit(goal)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Edit3 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {goal.description && <p className="text-sm text-gray-500 mt-1 break-words">{goal.description}</p>}
        {goal.progress !== undefined && !goal.completed && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ReminderItem = ({ reminder, onDismiss }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reminder.urgent ? 'bg-red-500' : 'bg-blue-500'}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900 break-words">{reminder.text}</p>
      <p className="text-xs text-gray-400 mt-0.5">{reminder.time}</p>
    </div>
    {onDismiss && (
      <button onClick={() => onDismiss(reminder.id)} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    )}
  </div>
);

const SectionHeader = ({ title, action, onAction, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    {action && (
      <button 
        onClick={onAction}
        className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
      >
        {action} <ChevronRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

const TabBar = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
          activeTab === tab.id 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// ============================================
// PERSONAL ASSISTANT - FULL IMPLEMENTATION
// ============================================

// Simulated AI response generation based on user preferences
const generateAIResponse = (userMessage, userPreferences, context) => {
  const msg = userMessage.toLowerCase();
  
  // Calendar queries
  if (msg.includes('schedule') || msg.includes('calendar') || msg.includes('meeting')) {
    if (msg.includes('today')) {
      return "You have 5 meetings today:\n\n• 9:00 AM - Daily standup (30 min)\n• 10:30 AM - Team sync with Sarah\n• 12:00 PM - Lunch with Mike\n• 2:00 PM - Project review\n• 4:00 PM - 1:1 with your manager\n\nYou have a 2-hour gap from 2:30-4:00 PM if you need focus time. Want me to block that off?";
    }
    if (msg.includes('tomorrow')) {
      return "Tomorrow looks lighter - you have 3 meetings:\n\n• 10:00 AM - Client call with Acme Corp\n• 1:00 PM - Design review\n• 3:30 PM - Weekly planning\n\nMorning is mostly free. Want me to schedule some focus time?";
    }
    if (msg.includes('free') || msg.includes('available')) {
      return "Looking at this week, your best availability is:\n\n• Tomorrow morning (8-10 AM)\n• Wednesday afternoon (2-5 PM)\n• Friday morning (9 AM-12 PM)\n\nWould you like me to suggest one of these slots for something?";
    }
    return "I can help with your calendar. Would you like to:\n\n• See today's schedule\n• Check tomorrow's meetings\n• Find free time this week\n• Schedule something new";
  }
  
  // Email queries
  if (msg.includes('email') || msg.includes('inbox') || msg.includes('mail')) {
    if (msg.includes('draft') || msg.includes('write') || msg.includes('compose')) {
      return "I'd be happy to draft an email. Who should I send it to, and what's the main point you want to communicate? I'll match your usual tone.";
    }
    if (msg.includes('unread') || msg.includes('new')) {
      return "You have 12 unread emails:\n\n• 3 marked priority (from Sarah, Mike, and your manager)\n• 5 newsletters (I can summarize if needed)\n• 4 routine updates\n\nWant me to summarize the priority emails first?";
    }
    return "Your inbox summary:\n\n• 12 unread emails (3 priority)\n• 2 drafts I've prepared for your review\n• 1 thread needs your response today\n\nWhat would you like to focus on?";
  }
  
  // Draft review
  if (msg.includes('show') && msg.includes('draft')) {
    return "I have 2 drafts ready:\n\n1. **Re: Q4 Budget Review** (to Finance team)\n   A response to their budget questions\n\n2. **Project Timeline Update** (to Sarah)\n   Following up on yesterday's discussion\n\nWhich one would you like to review first?";
  }
  
  // Contacts
  if (msg.includes('contact') || msg.includes('who is')) {
    return "I can help with contact information. Who are you looking for? I have access to your address book and can pull up details, recent conversations, and meeting history with anyone.";
  }
  
  // Preferences/learning
  if (msg.includes('tone') || msg.includes('style') || msg.includes('preference')) {
    const toneDesc = userPreferences.tone === 'formal' ? 'professional and formal' : 
                     userPreferences.tone === 'casual' ? 'friendly and casual' : 'balanced but professional';
    return `Based on your emails, I've learned your communication style is ${toneDesc}. You tend to:\n\n• ${userPreferences.traits.join('\n• ')}\n\nWould you like me to adjust any of these observations?`;
  }
  
  // Help/capabilities
  if (msg.includes('help') || msg.includes('what can you')) {
    return "I can help you with:\n\n📧 **Email** - Read, draft, and send emails in your voice\n📅 **Calendar** - Check schedule, find free time, schedule meetings\n👥 **Contacts** - Look up people, see recent interactions\n✅ **Tasks** - Track to-dos, set reminders\n\nI learn your preferences over time to draft emails that sound like you. What would you like to tackle?";
  }
  
  // Greeting responses
  if (msg.includes('good morning') || msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Good morning! Here's your quick briefing:\n\n• 5 meetings today (first at 9:00 AM)\n• 3 priority emails waiting\n• 2 drafts ready for your review\n\nWhat would you like to focus on first?`;
  }
  
  // Default
  return "I'm here to help with your emails, calendar, and contacts. I can draft messages in your voice, manage your schedule, or help you stay on top of communications. What would you like to do?";
};

// Email Draft Component
const EmailDraft = ({ draft, onApprove, onEdit, onReject, userPreferences }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(draft.body);
  const [showToneOptions, setShowToneOptions] = useState(false);
  
  const handleApprove = () => {
    onApprove(draft.id, editedContent);
  };
  
  const handleReject = () => {
    onReject(draft.id);
  };
  
  const regenerateWithTone = (tone) => {
    // Simulate regeneration with different tone
    const tones = {
      formal: `Dear ${draft.to.split(' ')[0]},\n\nThank you for your email regarding ${draft.subject.toLowerCase()}. I have reviewed the matter and would like to provide the following response.\n\n${draft.body}\n\nPlease do not hesitate to contact me should you require any additional information.\n\nBest regards`,
      casual: `Hey ${draft.to.split(' ')[0]}!\n\nThanks for reaching out about ${draft.subject.toLowerCase()}. Here's my take:\n\n${draft.body}\n\nLet me know if you need anything else!\n\nCheers`,
      concise: `Hi ${draft.to.split(' ')[0]},\n\n${draft.body}\n\nBest`
    };
    setEditedContent(tones[tone] || draft.body);
    setShowToneOptions(false);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Draft Email</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-blue-100 bg-white/20 px-2 py-0.5 rounded-full">
              {userPreferences.tone} tone
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="text-gray-400 w-16">To:</span>
            <span className="text-gray-900">{draft.to}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-16">Subject:</span>
            <span className="text-gray-900">{draft.subject}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
            {editedContent}
          </div>
        )}
      </div>
      
      {showToneOptions && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Regenerate with different tone:</p>
            <div className="flex gap-2">
              {['formal', 'casual', 'concise'].map(tone => (
                <button
                  key={tone}
                  onClick={() => regenerateWithTone(tone)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:bg-gray-50 capitalize"
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={() => setShowToneOptions(!showToneOptions)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Discard
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:opacity-90"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar Event Component
const CalendarEvent = ({ event, isNext }) => (
  <div className={`flex gap-3 p-3 rounded-lg ${isNext ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
    <div className="text-center min-w-[50px]">
      <p className={`text-sm font-semibold ${isNext ? 'text-blue-600' : 'text-gray-900'}`}>{event.time}</p>
      <p className="text-xs text-gray-400">{event.duration}</p>
    </div>
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <p className={`font-medium ${isNext ? 'text-blue-900' : 'text-gray-900'}`}>{event.title}</p>
          {event.attendees && (
            <p className="text-xs text-gray-500 mt-0.5">with {event.attendees}</p>
          )}
        </div>
        {isNext && (
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Next</span>
        )}
      </div>
      {event.location && (
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> {event.location}
        </p>
      )}
    </div>
  </div>
);

// Email Inbox Item
const EmailItem = ({ email, onSelect, isSelected }) => (
  <button
    onClick={() => onSelect(email)}
    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
      isSelected ? 'bg-blue-50' : ''
    } ${!email.read ? 'bg-blue-50/50' : ''}`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${email.priority ? 'bg-red-500' : email.read ? 'bg-transparent' : 'bg-blue-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {email.from}
          </p>
          <span className="text-xs text-gray-400">{email.time}</span>
        </div>
        <p className={`text-sm truncate ${!email.read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
          {email.subject}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{email.preview}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 mt-2" />
    </div>
  </button>
);

// Email Viewer Modal
const EmailViewerModal = ({ email, fullEmail, isLoading, error, onClose, onReply }) => {
  if (!email) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
              {email.from?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{email.from}</p>
              <p className="text-xs text-gray-500">{fullEmail?.fromEmail || email.fromEmail || ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Subject & Date */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 text-lg">{email.subject}</h2>
          <p className="text-sm text-gray-500 mt-1">{fullEmail?.date || email.time}</p>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : fullEmail?.isHtml ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: fullEmail.body }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
              {fullEmail?.body || email.preview}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button 
            onClick={() => onReply && onReply(email)}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2">
            <Forward className="w-4 h-4" />
            Forward
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// User Preferences Panel
const PreferencesPanel = ({ preferences, onUpdate, onClose }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  
  const toneOptions = [
    { id: 'professional', label: 'Professional', desc: 'Formal but approachable' },
    { id: 'casual', label: 'Casual', desc: 'Friendly and relaxed' },
    { id: 'formal', label: 'Formal', desc: 'Traditional business style' },
  ];
  
  const handleSave = () => {
    onUpdate(localPrefs);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Communication Preferences</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Email Tone</label>
            <div className="space-y-2">
              {toneOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setLocalPrefs({ ...localPrefs, tone: option.id })}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    localPrefs.tone === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Auto-Response Settings</label>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Draft responses automatically</p>
                  <p className="text-xs text-gray-500">I'll prepare drafts for routine emails</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={localPrefs.autoDraft}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, autoDraft: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Priority contact notifications</p>
                  <p className="text-xs text-gray-500">Alert me immediately for VIP contacts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={localPrefs.priorityAlerts}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, priorityAlerts: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-500"
                />
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Learned Traits</label>
            <div className="flex flex-wrap gap-2">
              {localPrefs.traits.map((trait, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {trait}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">These are learned from your email patterns</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:opacity-90"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Interface with Real Functionality
const ChatInterface = ({ agentName, agentColor, messages, onSendMessage, placeholder, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const maxMessageLength = 500;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim().slice(0, maxMessageLength));
      setInput('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <div className={`px-4 py-3 border-b border-gray-100 bg-gradient-to-r ${agentColor} rounded-t-xl`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">{agentName}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Start a conversation...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxMessageLength))}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || "Type a message..."}
            disabled={isTyping}
            maxLength={maxMessageLength}
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {['Show my schedule', 'Check emails', 'Show drafts'].map((suggestion, i) => (
            <button 
              key={i}
              onClick={() => { setInput(suggestion); }}
              disabled={isTyping}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PERSONAL ASSISTANT VIEW - FULL IMPLEMENTATION
// ============================================

const PersonalAssistantView = () => {
  const { personalAssistant, updatePersonalAssistant, healthCoach, googleAuth, googleLogin, googleLogout, fetchCalendarEvents, fetchEmails, fetchEmailById, sendEmail } = useAppData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Google data state
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  
  // Email viewer state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [fullEmail, setFullEmail] = useState(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  
  // Handle email selection
  const handleEmailSelect = async (email) => {
    setSelectedEmail(email);
    setFullEmail(null);
    setIsLoadingEmail(true);
    setEmailError(null);
    
    const result = await fetchEmailById(email.id);
    
    if (result.error) {
      setEmailError(result.error);
    } else {
      setFullEmail(result.email);
    }
    setIsLoadingEmail(false);
  };
  
  const handleCloseEmailViewer = () => {
    setSelectedEmail(null);
    setFullEmail(null);
    setEmailError(null);
  };
  
  // Fetch Google data when authenticated
  useEffect(() => {
    if (googleAuth) {
      loadGoogleData();
    }
  }, [googleAuth]);
  
  const loadGoogleData = async () => {
    setIsLoadingGoogle(true);
    setGoogleError(null);
    
    try {
      const [calendarResult, emailResult] = await Promise.all([
        fetchCalendarEvents(),
        fetchEmails(),
      ]);
      
      if (calendarResult.error) {
        setGoogleError(calendarResult.error);
      } else {
        // Transform calendar events to display format
        const formattedEvents = calendarResult.events.map(event => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          const durationMs = endDate - startDate;
          const durationMins = Math.round(durationMs / 60000);
          const durationStr = durationMins >= 60 
            ? `${Math.round(durationMins / 60 * 10) / 10} hr` 
            : `${durationMins} min`;
          
          return {
            id: event.id,
            time: event.allDay ? 'All Day' : startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            duration: event.allDay ? '' : durationStr,
            title: event.title,
            attendees: event.attendees || '',
            location: event.meetLink || event.location || '',
            meetLink: event.meetLink,
          };
        });
        setEvents(formattedEvents);
      }
      
      if (emailResult.error) {
        setGoogleError(emailResult.error);
      } else {
        setEmails(emailResult.emails || []);
      }
    } catch (e) {
      setGoogleError('Failed to load Google data');
      console.error(e);
    } finally {
      setIsLoadingGoogle(false);
    }
  };
  
  // Get data from persistent store
  const userPreferences = personalAssistant.preferences;
  const drafts = personalAssistant.drafts;
  const goals = personalAssistant.goals;
  const reminders = personalAssistant.reminders;
  
  // Get health data for cross-agent insights
  const getLocalDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const todayKey = getLocalDateKey(new Date());
  const todayHealthLogs = healthCoach.dailyLogs?.[todayKey] || [];
  const todaySleep = todayHealthLogs.find(l => l.type === 'sleep')?.value || 0;
  const todayExercise = todayHealthLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0);
  
  // Generate health-related productivity insight
  const getHealthInsight = () => {
    if (todaySleep >= 8) {
      return { text: 'Well-rested today - perfect for tackling challenging tasks!', type: 'positive', icon: Moon };
    }
    if (todaySleep > 0 && todaySleep < 6) {
      return { text: 'Light sleep - consider scheduling easier tasks and taking breaks.', type: 'warning', icon: Moon };
    }
    if (todayExercise >= 30) {
      return { text: 'Exercise done! Your focus and creativity should be boosted.', type: 'positive', icon: Activity };
    }
    return null;
  };
  
  const healthInsight = getHealthInsight();
  
  // Chat messages - also persisted
  const [messages, setMessages] = useState(() => {
    if (personalAssistant.chatHistory.length > 0) {
      return personalAssistant.chatHistory;
    }
    return [
      { 
        sender: 'agent', 
        text: googleAuth 
          ? `Good morning! I'm connected to your Google account. Ask me about your calendar or emails!`
          : "Good morning! Connect your Google account to see your real calendar and emails.", 
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ];
  });
  
  // Save chat history when messages change
  useEffect(() => {
    updatePersonalAssistant(prev => ({
      ...prev,
      chatHistory: messages
    }));
  }, [messages]);
  
  // Update preferences
  const setUserPreferences = (newPrefs) => {
    updatePersonalAssistant(prev => ({
      ...prev,
      preferences: typeof newPrefs === 'function' ? newPrefs(prev.preferences) : newPrefs
    }));
  };
  
  // Update drafts
  const setDrafts = (newDrafts) => {
    updatePersonalAssistant(prev => ({
      ...prev,
      drafts: typeof newDrafts === 'function' ? newDrafts(prev.drafts) : newDrafts
    }));
  };
  
  // Update goals
  const setGoals = (newGoals) => {
    updatePersonalAssistant(prev => ({
      ...prev,
      goals: typeof newGoals === 'function' ? newGoals(prev.goals) : newGoals
    }));
  };
  
  // Update reminders
  const setReminders = (newReminders) => {
    updatePersonalAssistant(prev => ({
      ...prev,
      reminders: typeof newReminders === 'function' ? newReminders(prev.reminders) : newReminders
    }));
  };
  
  // Handle adding a new goal
  const handleAddGoal = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    setToast({ message: 'Goal added!', type: 'success' });
  };
  
  // Handle editing a goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowEditGoal(true);
  };
  
  // Handle saving edited goal
  const handleSaveGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    setToast({ message: 'Goal updated!', type: 'success' });
  };
  
  // Handle deleting a goal
  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    setToast({ message: 'Goal deleted', type: 'success' });
  };
  
  // Handle adding a new reminder
  const handleAddReminder = (newReminder) => {
    setReminders(prev => [newReminder, ...prev]);
    setToast({ message: 'Reminder set!', type: 'success' });
  };
  
  // Handle goal toggle
  const handleToggleGoal = (goalId) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g
    ));
  };
  
  // Handle sending a message
  const handleSendMessage = (text) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text, time: timeStr }]);
    
    // Simulate typing
    setIsTyping(true);
    
    // Generate AI response
    setTimeout(() => {
      const response = generateAIResponse(text, userPreferences, { events, emails, drafts });
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'agent', text: response, time: timeStr }]);
    }, 1000 + Math.random() * 1000);
  };
  
  // Handle draft actions
  const handleApproveDraft = (id, content) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    // Show success feedback
  };
  
  const handleRejectDraft = (id) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };
  
  const handleDismissReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Personal Assistant</h2>
              <p className="text-blue-100 text-sm">
                {googleAuth ? `Connected as ${googleAuth.user?.email}` : 'Managing your communications & schedule'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {googleAuth ? (
              <button 
                onClick={googleLogout}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 text-sm flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Disconnect
              </button>
            ) : (
              <button 
                onClick={googleLogin}
                className="px-3 py-1.5 bg-white rounded-lg hover:bg-white/90 text-blue-600 text-sm font-medium flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Google
              </button>
            )}
            <button 
              onClick={() => setShowPreferences(true)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoadingGoogle && (
          <div className="flex items-center justify-center gap-2 py-2 mb-2 bg-white/10 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading your Google data...</span>
          </div>
        )}
        
        {/* Error message */}
        {googleError && (
          <div className="flex items-center gap-2 py-2 px-3 mb-2 bg-red-500/20 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{googleError}</span>
            <button onClick={loadGoogleData} className="ml-auto underline">Retry</button>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{emails.filter(e => !e.read).length}</p>
            <p className="text-xs text-blue-100">Unread Emails</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs text-blue-100">Meetings Today</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{drafts.length}</p>
            <p className="text-xs text-blue-100">Drafts Ready</p>
          </div>
        </div>
        
        {/* Refresh button when connected */}
        {googleAuth && !isLoadingGoogle && (
          <button 
            onClick={loadGoogleData}
            className="mt-3 w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        )}
      </div>
      
      {/* Connect Google Banner (if not connected) */}
      {!googleAuth && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-900">Connect Google for real data</p>
            <p className="text-sm text-amber-700">See your actual calendar events and emails</p>
          </div>
          <button 
            onClick={googleLogin}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
          >
            Connect
          </button>
        </div>
      )}
      
      {/* Health Insight Banner */}
      {healthInsight && (
        <div className={`rounded-xl p-3 border flex items-center gap-3 ${
          healthInsight.type === 'positive' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <healthInsight.icon className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{healthInsight.text}</p>
          <span className="text-xs opacity-70">← Health</span>
        </div>
      )}
      
      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Drafts Ready */}
          {drafts.length > 0 && (
            <div>
              <SectionHeader title="Drafts Ready for Review" icon={FileText} />
              <div className="space-y-4">
                {drafts.map(draft => (
                  <EmailDraft 
                    key={draft.id}
                    draft={draft}
                    userPreferences={userPreferences}
                    onApprove={handleApproveDraft}
                    onReject={handleRejectDraft}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Today's Schedule Preview */}
          <div>
            <SectionHeader title="Today's Schedule" icon={Calendar} action="Full Calendar" onAction={() => setActiveTab('calendar')} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
              {events.slice(0, 3).map((event, i) => (
                <CalendarEvent key={event.id} event={event} isNext={i === 0} />
              ))}
              {events.length > 3 && (
                <p className="text-center text-sm text-gray-400">+ {events.length - 3} more meetings</p>
              )}
            </div>
          </div>
          
          {/* Reminders */}
          <div>
            <SectionHeader title="Reminders" icon={Bell} action="Add" onAction={() => setShowAddReminder(true)} />
            {reminders.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {reminders.map(r => (
                  <ReminderItem key={r.id} reminder={r} onDismiss={handleDismissReminder} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No reminders"
                description="Add reminders to stay on top of important tasks"
                actionLabel="Add Reminder"
                onAction={() => setShowAddReminder(true)}
                color="blue"
              />
            )}
          </div>
          
          {/* Goals */}
          <div>
            <SectionHeader title="Your Goals" icon={Target} action="Add Goal" onAction={() => setShowAddGoal(true)} />
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map(goal => <GoalCard key={goal.id} goal={goal} onToggle={handleToggleGoal} onEdit={handleEditGoal} />)}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No goals yet"
                description="Set your first goal to start tracking your progress"
                actionLabel="Add Goal"
                onAction={() => setShowAddGoal(true)}
                color="blue"
              />
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Inbox</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {emails.filter(e => !e.read).length} unread
                </span>
              </div>
              <button 
                onClick={loadGoogleData}
                disabled={isLoadingGoogle}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoadingGoogle ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {emails.length > 0 ? (
              emails.map(email => (
                <EmailItem 
                  key={email.id} 
                  email={email} 
                  onSelect={handleEmailSelect}
                  isSelected={selectedEmail?.id === email.id}
                />
              ))
            ) : googleAuth ? (
              <div className="p-8 text-center">
                <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No emails found</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">Connect Google to see your emails</p>
                <button 
                  onClick={googleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                >
                  Connect Google
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Summarize Unread</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50">
              <Edit3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Draft New Email</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Email Viewer Modal */}
      {selectedEmail && (
        <EmailViewerModal
          email={selectedEmail}
          fullEmail={fullEmail}
          isLoading={isLoadingEmail}
          error={emailError}
          onClose={handleCloseEmailViewer}
        />
      )}
      
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Today, March 12</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {events.map((event, i) => (
                <CalendarEvent key={event.id} event={event} isNext={i === 0} />
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50">
              <Plus className="w-4 h-4 text-blue-500" />
              <span className="text-sm">New Event</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Find Free Time</span>
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'chat' && (
        <ChatInterface 
          agentName="Personal Assistant"
          agentColor="from-blue-500 to-indigo-500"
          messages={messages}
          onSendMessage={handleSendMessage}
          placeholder="Ask about your schedule, emails..."
          isTyping={isTyping}
        />
      )}
      
      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesPanel 
          preferences={userPreferences}
          onUpdate={setUserPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
      
      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
        agentType="personal"
      />
      
      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={showEditGoal}
        onClose={() => {
          setShowEditGoal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
      
      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        onAdd={handleAddReminder}
      />
      
      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

// ============================================
// HEALTH COACH - FULL IMPLEMENTATION
// ============================================

// Health-specific logging modal
const LogHealthModal = ({ isOpen, onClose, onLog, logType }) => {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  
  const config = {
    water: {
      title: 'Log Water Intake',
      icon: Droplets,
      unit: 'glasses',
      quickOptions: [1, 2, 3, 4],
      color: 'cyan',
      placeholder: 'Number of glasses',
    },
    sleep: {
      title: 'Log Sleep',
      icon: Moon,
      unit: 'hours',
      quickOptions: [5, 6, 7, 8, 9],
      color: 'indigo',
      placeholder: 'Hours slept',
    },
    exercise: {
      title: 'Log Exercise',
      icon: Activity,
      unit: 'minutes',
      quickOptions: [15, 30, 45, 60],
      color: 'orange',
      placeholder: 'Minutes exercised',
    },
    meal: {
      title: 'Log Meal',
      icon: Apple,
      unit: 'meal',
      quickOptions: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      color: 'green',
      placeholder: 'What did you eat?',
      isText: true,
    },
    weight: {
      title: 'Log Weight',
      icon: Scale,
      unit: 'lbs',
      quickOptions: [],
      color: 'purple',
      placeholder: 'Your weight',
      isDecimal: true,
    },
  };
  
  const currentConfig = config[logType] || config.water;
  const IconComponent = currentConfig.icon;
  
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500',
    indigo: 'from-indigo-500 to-purple-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
  };
  
  const handleSubmit = () => {
    if (!value) return;
    
    // For numeric values, ensure it's a valid positive number
    if (!currentConfig.isText) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) return;
    }
    
    onLog({
      type: logType,
      value: currentConfig.isText ? value.trim().slice(0, 100) : parseFloat(value),
      unit: currentConfig.unit,
      notes: notes.trim().slice(0, 200),
      timestamp: new Date().toISOString(),
    });
    
    setValue('');
    setNotes('');
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentConfig.title}>
      <div className="p-4 space-y-4">
        <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[currentConfig.color]} rounded-2xl flex items-center justify-center mx-auto`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        
        {!currentConfig.isText && currentConfig.quickOptions.length > 0 ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick add:</label>
              <div className="flex gap-2 justify-center">
                {currentConfig.quickOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setValue(opt.toString())}
                    className={`w-14 h-14 rounded-xl border-2 font-semibold transition-all ${
                      value === opt.toString()
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm">or enter custom amount</div>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={currentConfig.placeholder}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg"
              />
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
                {currentConfig.unit}
              </div>
            </div>
          </>
        ) : currentConfig.isText ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal type:</label>
              <div className="flex gap-2 flex-wrap justify-center">
                {currentConfig.quickOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setValue(opt)}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                      value === opt
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What did you eat? (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your meal..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </>
        ) : (
          /* For weight and other numeric-only inputs */
          <div className="flex gap-2">
            <input
              type="number"
              step={currentConfig.isDecimal ? "0.1" : "1"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentConfig.placeholder}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg"
              autoFocus
            />
            <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
              {currentConfig.unit}
            </div>
          </div>
        )}
        
        {!currentConfig.isText && logType !== 'weight' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!value}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Log {currentConfig.unit === 'meal' ? 'Meal' : logType === 'weight' ? `${value || ''} ${currentConfig.unit}` : value ? `${value} ${currentConfig.unit}` : ''}
        </button>
      </div>
    </Modal>
  );
};

// Health stat card component
const HealthStatCard = ({ icon: Icon, label, value, target, unit, color, onClick, isWeightGoal }) => {
  // For weight goals, we show progress differently (how close to goal weight)
  let percentage = 0;
  let displayTarget = target;
  
  if (isWeightGoal && target && value && value !== '—') {
    // For weight, don't show a progress bar - just show current vs goal
    displayTarget = target;
  } else if (target) {
    percentage = Math.min((value / target) * 100, 100);
  }
  
  const colorClasses = {
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', progress: 'from-cyan-500 to-blue-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', progress: 'from-indigo-500 to-purple-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', progress: 'from-orange-500 to-red-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', progress: 'from-green-500 to-emerald-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', progress: 'from-purple-500 to-pink-500' },
  };
  
  const colors = colorClasses[color] || colorClasses.cyan;
  
  return (
    <button 
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-semibold text-gray-900">
            {value}{unit && <span className="text-gray-400 font-normal"> {unit}</span>}
            {isWeightGoal && target ? (
              <span className="text-gray-400 font-normal text-sm"> → {target}</span>
            ) : target ? (
              <span className="text-gray-400 font-normal text-sm"> / {target}</span>
            ) : null}
          </p>
        </div>
      </div>
      {target && !isWeightGoal && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isWeightGoal && value && value !== '—' && target && (
        <div className="text-xs text-center mt-1">
          {value > target ? (
            <span className="text-orange-500">{(value - target).toFixed(1)} lbs to go</span>
          ) : value < target ? (
            <span className="text-blue-500">{(target - value).toFixed(1)} lbs to gain</span>
          ) : (
            <span className="text-emerald-500">🎉 Goal reached!</span>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2 text-center">Tap to log</p>
    </button>
  );
};

// Streak display component
const StreakBadge = ({ streak, label }) => (
  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white text-center">
    <div className="text-3xl font-bold">{streak}</div>
    <div className="text-amber-100 text-sm">{label}</div>
    <div className="flex justify-center gap-1 mt-2">
      {[...Array(Math.min(streak, 7))].map((_, i) => (
        <div key={i} className="w-2 h-2 bg-white rounded-full" />
      ))}
    </div>
  </div>
);

// Generate health coach AI response
const generateHealthResponse = (userMessage, healthData, todayLogs) => {
  const msg = userMessage.toLowerCase();
  
  // Water-related
  if (msg.includes('water') || msg.includes('hydrat')) {
    const waterToday = todayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0);
    if (waterToday >= 8) {
      return `Amazing! You've hit your water goal today with ${waterToday} glasses! 💧 Staying hydrated helps with energy, focus, and overall health. Keep it up!`;
    } else {
      return `You've had ${waterToday} glasses of water today. ${8 - waterToday} more to reach your goal! Try keeping a water bottle nearby as a visual reminder. Would you like me to set a reminder?`;
    }
  }
  
  // Sleep-related
  if (msg.includes('sleep') || msg.includes('tired') || msg.includes('rest')) {
    const lastSleep = todayLogs.find(l => l.type === 'sleep');
    if (lastSleep) {
      if (lastSleep.value >= 8) {
        return `Great job getting ${lastSleep.value} hours of sleep! Quality rest is crucial for recovery and mental clarity. How are you feeling today?`;
      } else {
        return `You logged ${lastSleep.value} hours of sleep. For optimal health, aim for 7-9 hours. Some tips:\n\n• Keep a consistent sleep schedule\n• Avoid screens 1 hour before bed\n• Keep your room cool and dark\n\nWould you like me to remind you to wind down tonight?`;
      }
    }
    return "I don't have your sleep logged for today yet. Tap the sleep card to log how many hours you got. Tracking sleep patterns helps identify what affects your rest quality.";
  }
  
  // Exercise-related
  if (msg.includes('exercise') || msg.includes('workout') || msg.includes('active')) {
    const exerciseToday = todayLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0);
    if (exerciseToday > 0) {
      return `You've logged ${exerciseToday} minutes of exercise today! ${exerciseToday >= 30 ? "That's great - you've hit the recommended daily minimum! 🎉" : `${30 - exerciseToday} more minutes to hit the daily recommendation.`}`;
    }
    return "No exercise logged yet today. Even a 10-minute walk counts! What kind of movement do you enjoy? I can help you set achievable fitness goals.";
  }
  
  // Meal/nutrition-related
  if (msg.includes('meal') || msg.includes('food') || msg.includes('eat') || msg.includes('nutrition')) {
    const mealsToday = todayLogs.filter(l => l.type === 'meal');
    return `You've logged ${mealsToday.length} meal${mealsToday.length !== 1 ? 's' : ''} today. Consistent meal tracking helps identify eating patterns and nutritional balance. Remember to include protein, vegetables, and whole grains in each meal!`;
  }
  
  // Progress/summary
  if (msg.includes('progress') || msg.includes('how am i') || msg.includes('summary') || msg.includes('today')) {
    const waterToday = todayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0);
    const sleepToday = todayLogs.find(l => l.type === 'sleep')?.value || 0;
    const exerciseToday = todayLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0);
    const mealsToday = todayLogs.filter(l => l.type === 'meal').length;
    
    return `Here's your daily summary:\n\n💧 Water: ${waterToday}/8 glasses\n😴 Sleep: ${sleepToday} hours\n🏃 Exercise: ${exerciseToday} minutes\n🍎 Meals logged: ${mealsToday}\n\n${waterToday >= 8 && sleepToday >= 7 ? "You're doing great today! Keep it up! 🌟" : "Keep going - small consistent steps lead to big results!"}`;
  }
  
  // Greeting/general
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('morning') || msg.includes('afternoon')) {
    const waterToday = todayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0);
    return `Hello! I'm your Health Coach, here to help you build healthy habits. 🌱\n\nToday so far:\n💧 ${waterToday}/8 glasses of water\n\nWhat would you like to focus on? I can help with hydration, sleep, exercise, or nutrition tracking.`;
  }
  
  // Help
  if (msg.includes('help') || msg.includes('what can you')) {
    return `I can help you with:\n\n💧 **Hydration** - Track water intake, set reminders\n😴 **Sleep** - Log sleep hours, improve sleep quality\n🏃 **Exercise** - Track workouts, set fitness goals\n🍎 **Nutrition** - Log meals, build healthy eating habits\n\nJust tap any stat card to quickly log, or chat with me about your health goals!`;
  }
  
  // Default
  return "I'm here to help you build healthy habits! You can ask me about your water intake, sleep, exercise, or nutrition. Or tap any of the stat cards above to quickly log your progress.";
};

// Health Settings Modal
const HealthSettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [enabledMetrics, setEnabledMetrics] = useState(settings.enabledMetrics || {});
  const [targets, setTargets] = useState(settings.targets || {});
  
  useEffect(() => {
    if (settings) {
      setEnabledMetrics(settings.enabledMetrics || {});
      setTargets(settings.targets || {});
    }
  }, [settings]);
  
  const metrics = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-cyan-500', unit: 'glasses', defaultTarget: 8, targetLabel: 'Daily target' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-500', unit: 'hours', defaultTarget: 8, targetLabel: 'Daily target' },
    { id: 'exercise', label: 'Exercise', icon: Activity, color: 'text-orange-500', unit: 'minutes', defaultTarget: 30, targetLabel: 'Daily target' },
    { id: 'meal', label: 'Meals', icon: Apple, color: 'text-green-500', unit: 'meals', defaultTarget: 3, targetLabel: 'Daily target' },
    { id: 'weight', label: 'Weight', icon: Scale, color: 'text-purple-500', unit: 'lbs', defaultTarget: 150, targetLabel: 'Goal weight', isGoalTarget: true },
  ];
  
  const handleToggle = (metricId) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };
  
  const handleTargetChange = (metricId, value) => {
    setTargets(prev => ({
      ...prev,
      [metricId]: parseFloat(value) || 0
    }));
  };
  
  const handleSave = () => {
    onSave({ enabledMetrics, targets });
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Health Tracking Settings">
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <p className="text-sm text-gray-500">Choose which health metrics you want to track and set your targets.</p>
        
        {metrics.map(metric => {
          const IconComponent = metric.icon;
          const isEnabled = enabledMetrics[metric.id];
          
          return (
            <div 
              key={metric.id} 
              className={`p-4 rounded-xl border-2 transition-all ${
                isEnabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-white' : 'bg-gray-100'}`}>
                    <IconComponent className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    {isEnabled && (
                      <p className="text-xs text-gray-500">
                        {metric.isGoalTarget ? 'Goal' : 'Target'}: {targets[metric.id] || metric.defaultTarget} {metric.unit}{!metric.isGoalTarget && '/day'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(metric.id)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    isEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {isEnabled && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <label className="text-xs text-gray-500 mb-1 block">{metric.targetLabel} ({metric.unit})</label>
                  <input
                    type="number"
                    step={metric.id === 'weight' ? '0.1' : '1'}
                    value={targets[metric.id] || metric.defaultTarget}
                    onChange={(e) => handleTargetChange(metric.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:opacity-90"
        >
          Save Settings
        </button>
      </div>
    </Modal>
  );
};

// Export Data Modal
const ExportDataModal = ({ isOpen, onClose, healthData }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  
  const generateCSV = () => {
    const dailyLogs = healthData.dailyLogs || {};
    const rows = [['Date', 'Type', 'Value', 'Unit', 'Notes', 'Timestamp']];
    
    // Sort dates
    const sortedDates = Object.keys(dailyLogs).sort();
    
    for (const date of sortedDates) {
      const logs = dailyLogs[date] || [];
      for (const log of logs) {
        rows.push([
          date,
          log.type,
          log.value,
          log.unit || '',
          log.notes || '',
          log.timestamp || ''
        ]);
      }
    }
    
    // Convert to CSV string
    const csvContent = rows.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if needed
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
    
    return csvContent;
  };
  
  const generateJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      goals: healthData.goals,
      dailyLogs: healthData.dailyLogs,
      settings: {
        enabledMetrics: healthData.enabledMetrics,
        targets: healthData.targets,
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  };
  
  const handleExport = () => {
    let content, filename, mimeType;
    
    if (exportFormat === 'csv') {
      content = generateCSV();
      filename = `health-data-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = generateJSON();
      filename = `health-data-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onClose();
  };
  
  // Calculate stats for display
  const dailyLogs = healthData.dailyLogs || {};
  const totalDays = Object.keys(dailyLogs).length;
  const totalEntries = Object.values(dailyLogs).reduce((sum, logs) => sum + logs.length, 0);
  const dateRange = Object.keys(dailyLogs).sort();
  const firstDate = dateRange[0];
  const lastDate = dateRange[dateRange.length - 1];
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Health Data">
      <div className="p-4 space-y-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Your Health Data</p>
              <p className="text-sm text-gray-500">{totalEntries} entries across {totalDays} days</p>
            </div>
          </div>
          {firstDate && lastDate && (
            <p className="text-xs text-gray-500">
              Date range: {new Date(firstDate).toLocaleDateString()} — {new Date(lastDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportFormat === 'csv' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">CSV</p>
              <p className="text-xs text-gray-500 mt-1">Opens in Excel, Google Sheets</p>
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                exportFormat === 'json' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">JSON</p>
              <p className="text-xs text-gray-500 mt-1">Full data backup, includes goals & settings</p>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            {exportFormat === 'csv' 
              ? '📊 CSV exports your daily logs in a spreadsheet-friendly format. Great for creating charts and analyzing trends.'
              : '💾 JSON exports everything including goals, settings, and all logs. Use this for a complete backup that can be re-imported later.'}
          </p>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleExport}
          disabled={totalEntries === 0}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          Download {exportFormat.toUpperCase()}
        </button>
      </div>
    </Modal>
  );
};

// Import Data Modal
const ImportDataModal = ({ isOpen, onClose, onImport }) => {
  const [importData, setImportData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [error, setError] = useState('');
  const [importMode, setImportMode] = useState('merge');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const resetState = () => {
    setImportData(null);
    setFileName('');
    setFileType('');
    setError('');
    setPreview(null);
  };
  
  // Parse CSV content into dailyLogs format
  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    // Parse header - handle quoted headers
    const parseCSVLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      return values;
    };
    
    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    // Find column indices
    const dateIdx = header.findIndex(h => h === 'date');
    const typeIdx = header.findIndex(h => h === 'type');
    const valueIdx = header.findIndex(h => h === 'value');
    const unitIdx = header.findIndex(h => h === 'unit');
    const notesIdx = header.findIndex(h => h === 'notes');
    const timestampIdx = header.findIndex(h => h === 'timestamp');
    
    if (dateIdx === -1 || typeIdx === -1 || valueIdx === -1) {
      throw new Error('CSV must have Date, Type, and Value columns');
    }
    
    const dailyLogs = {};
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      
      const date = values[dateIdx];
      const type = values[typeIdx]?.toLowerCase();
      let value = values[valueIdx];
      const unit = unitIdx !== -1 ? values[unitIdx] : '';
      const notes = notesIdx !== -1 ? values[notesIdx] : '';
      const timestamp = timestampIdx !== -1 && values[timestampIdx] ? values[timestampIdx] : new Date().toISOString();
      
      if (!date || !type || value === undefined || value === '') continue;
      
      // Convert value to number if applicable
      if (type !== 'meal') {
        value = parseFloat(value) || 0;
      }
      
      // Initialize date array if needed
      if (!dailyLogs[date]) {
        dailyLogs[date] = [];
      }
      
      dailyLogs[date].push({
        type,
        value,
        unit: unit || (type === 'water' ? 'glasses' : type === 'sleep' ? 'hours' : type === 'exercise' ? 'minutes' : type === 'weight' ? 'lbs' : ''),
        notes,
        timestamp,
      });
    }
    
    return { dailyLogs, goals: [], settings: null };
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError('');
    setFileName(file.name);
    
    const isJSON = file.name.toLowerCase().endsWith('.json');
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    
    if (!isJSON && !isCSV) {
      setError('Please select a JSON or CSV file.');
      return;
    }
    
    setFileType(isJSON ? 'json' : 'csv');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data;
        
        if (isJSON) {
          data = JSON.parse(event.target.result);
          
          if (!data.dailyLogs || typeof data.dailyLogs !== 'object') {
            setError('Invalid JSON format. This doesn\'t appear to be a valid health data export.');
            return;
          }
        } else {
          data = parseCSV(event.target.result);
        }
        
        const totalDays = Object.keys(data.dailyLogs).length;
        const totalEntries = Object.values(data.dailyLogs).reduce((sum, logs) => sum + (Array.isArray(logs) ? logs.length : 0), 0);
        const dateRange = Object.keys(data.dailyLogs).sort();
        const goalsCount = data.goals?.length || 0;
        
        setPreview({
          totalDays,
          totalEntries,
          firstDate: dateRange[0],
          lastDate: dateRange[dateRange.length - 1],
          goalsCount,
          hasSettings: !!(data.settings?.enabledMetrics || data.settings?.targets),
          exportDate: data.exportDate,
          fileType: isJSON ? 'JSON' : 'CSV',
        });
        
        setImportData(data);
      } catch (err) {
        setError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    if (!importData) return;
    onImport(importData, importMode);
    resetState();
    onClose();
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Health Data">
      <div className="p-4 space-y-4">
        {!importData ? (
          <>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-700">Click to select a file</p>
              <p className="text-sm text-gray-500 mt-1">JSON or CSV files</p>
              {fileName && <p className="text-sm text-emerald-600 mt-2">{fileName}</p>}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {error && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">
                📁 <strong>JSON:</strong> Full backup with goals & settings<br/>
                📊 <strong>CSV:</strong> Daily logs only (must have Date, Type, Value columns)
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-500">{preview.totalEntries} entries across {preview.totalDays} days</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>📄 File type: {preview.fileType}</p>
                {preview.firstDate && preview.lastDate && (
                  <p>📅 Date range: {new Date(preview.firstDate).toLocaleDateString()} — {new Date(preview.lastDate).toLocaleDateString()}</p>
                )}
                {preview.goalsCount > 0 && <p>🎯 {preview.goalsCount} goals</p>}
                {preview.hasSettings && <p>⚙️ Includes settings</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Import Mode</label>
              <div className="space-y-2">
                <button
                  onClick={() => setImportMode('merge')}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    importMode === 'merge' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Merge with existing data</p>
                  <p className="text-xs text-gray-500 mt-0.5">Combines imported logs with your current data</p>
                </button>
                <button
                  onClick={() => setImportMode('replace')}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    importMode === 'replace' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Replace all data</p>
                  <p className="text-xs text-gray-500 mt-0.5">Overwrites everything with imported data</p>
                </button>
              </div>
            </div>
            
            {importMode === 'replace' && (
              <div className="bg-amber-50 text-amber-700 rounded-lg p-3 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Warning: This will replace all your current health data.</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={handleClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        {importData && (
          <button 
            onClick={handleImport}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 ${
              importMode === 'replace' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
          >
            {importMode === 'replace' ? 'Replace Data' : 'Merge Data'}
          </button>
        )}
      </div>
    </Modal>
  );
};

const HealthCoachView = () => {
  const { healthCoach, updateHealthCoach, userProfile } = useAppData();
  
  const [activeTab, setActiveTab] = useState('today');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState('water');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Migrate old goals to have auto-tracking properties
  useEffect(() => {
    const needsMigration = healthCoach.goals.some(g => {
      const title = g.title.toLowerCase();
      const hasTrackingKeyword = title.includes('water') || title.includes('sleep') || title.includes('exercise');
      return hasTrackingKeyword && !g.autoTracked;
    });
    
    if (needsMigration) {
      updateHealthCoach(prev => ({
        ...prev,
        goals: prev.goals.map(goal => {
          const title = goal.title.toLowerCase();
          if (title.includes('water') && !goal.autoTracked) {
            return { ...goal, autoTracked: true, trackingType: 'water', target: 8 };
          }
          if (title.includes('sleep') && !goal.autoTracked) {
            return { ...goal, autoTracked: true, trackingType: 'sleep', target: 8 };
          }
          if (title.includes('exercise') && !goal.autoTracked) {
            return { ...goal, autoTracked: true, trackingType: 'exercise', target: 30 };
          }
          if (title.includes('meal') && !goal.autoTracked) {
            return { ...goal, autoTracked: true, trackingType: 'meal', target: 3 };
          }
          return goal;
        })
      }));
    }
  }, []);
  
  // Get data from persistent store
  const goals = healthCoach.goals;
  const dailyLogs = healthCoach.dailyLogs || {};
  const enabledMetrics = healthCoach.enabledMetrics || { water: true, sleep: true, exercise: true, meal: true, weight: false };
  const targets = healthCoach.targets || { water: 8, sleep: 8, exercise: 30, meal: 3, weight: 150 };
  
  // Helper to get local date key
  const getLocalDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Get today's date key (using local date, not UTC)
  const todayKey = getLocalDateKey(new Date());
  const todayLogs = dailyLogs[todayKey] || [];
  
  // Get the most recent weight from all logs (not just today)
  const getLastLoggedWeight = () => {
    const allDates = Object.keys(dailyLogs).sort().reverse();
    for (const dateKey of allDates) {
      const weightLog = dailyLogs[dateKey]?.filter(l => l.type === 'weight').pop();
      if (weightLog) {
        return { value: weightLog.value, date: dateKey };
      }
    }
    return null;
  };
  
  const lastWeight = getLastLoggedWeight();
  
  // Calculate stats for a date range
  const calculateRangeStats = (startDate, endDate) => {
    const stats = {
      water: 0,
      sleep: 0,
      exercise: 0,
      meals: 0,
      daysLogged: 0,
      weights: [],
    };
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = getLocalDateKey(current);
      const logs = dailyLogs[dateKey] || [];
      
      if (logs.length > 0) {
        stats.daysLogged++;
        stats.water += logs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0);
        stats.sleep += logs.filter(l => l.type === 'sleep').reduce((sum, l) => sum + l.value, 0);
        stats.exercise += logs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0);
        stats.meals += logs.filter(l => l.type === 'meal').length;
        
        const weightLog = logs.find(l => l.type === 'weight');
        if (weightLog) {
          stats.weights.push({ date: dateKey, value: weightLog.value });
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return stats;
  };
  
  // Calculate this week's stats (Sunday to Saturday)
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
  };
  
  // Calculate this month's stats
  const getMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return { start: startOfMonth, end: endOfMonth };
  };
  
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();
  const weekStats = calculateRangeStats(weekRange.start, weekRange.end);
  const monthStats = calculateRangeStats(monthRange.start, monthRange.end);
  
  // Generate chart data for the past 7 days
  const generateWeeklyChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = getLocalDateKey(date);
      const dayLogs = dailyLogs[dateKey] || [];
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateKey,
        water: dayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0),
        sleep: dayLogs.find(l => l.type === 'sleep')?.value || 0,
        exercise: dayLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0),
        meals: dayLogs.filter(l => l.type === 'meal').length,
      });
    }
    
    return data;
  };
  
  // Generate weight trend data
  const generateWeightChartData = () => {
    const allWeights = [];
    const sortedDates = Object.keys(dailyLogs).sort();
    
    for (const dateKey of sortedDates) {
      const weightLog = dailyLogs[dateKey]?.find(l => l.type === 'weight');
      if (weightLog) {
        allWeights.push({
          date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: dateKey,
          weight: weightLog.value,
          goal: targets.weight || 150,
        });
      }
    }
    
    return allWeights.slice(-14); // Last 14 entries
  };
  
  const weeklyChartData = generateWeeklyChartData();
  const weightChartData = generateWeightChartData();
  
  // Calculate today's stats
  const todayStats = {
    water: todayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0),
    sleep: todayLogs.find(l => l.type === 'sleep')?.value || 0,
    exercise: todayLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0),
    meals: todayLogs.filter(l => l.type === 'meal').length,
    weight: todayLogs.find(l => l.type === 'weight')?.value || (lastWeight?.value || null),
  };
  
  // Auto-update goals based on today's logs
  const goalsWithProgress = goals.map(goal => {
    if (goal.autoTracked && goal.trackingType) {
      let currentValue = 0;
      const target = goal.target || targets[goal.trackingType] || 1;
      
      switch (goal.trackingType) {
        case 'water':
          currentValue = todayStats.water;
          break;
        case 'sleep':
          currentValue = todayStats.sleep;
          break;
        case 'exercise':
          currentValue = todayStats.exercise;
          break;
        case 'meal':
          currentValue = todayStats.meals;
          break;
        default:
          currentValue = 0;
      }
      
      const progress = Math.min(Math.round((currentValue / target) * 100), 100);
      const description = `${currentValue}/${target} ${goal.trackingType === 'meal' ? 'meals' : goal.trackingType === 'water' ? 'glasses' : goal.trackingType === 'sleep' ? 'hours' : 'minutes'}`;
      
      return {
        ...goal,
        progress,
        description,
        completed: progress >= 100,
      };
    }
    return goal;
  });
  
  // Calculate streak (consecutive days with any logs)
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    const getLocalDateKey = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    while (true) {
      const dateKey = getLocalDateKey(currentDate);
      if (dailyLogs[dateKey] && dailyLogs[dateKey].length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0) {
        // Check if today has no logs yet, still count yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayKey = getLocalDateKey(currentDate);
        if (dailyLogs[yesterdayKey] && dailyLogs[yesterdayKey].length > 0) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
      if (streak > 365) break; // Safety limit
    }
    
    return streak;
  };
  
  const streak = calculateStreak();
  
  // Chat messages
  const [messages, setMessages] = useState(() => {
    if (healthCoach.chatHistory && healthCoach.chatHistory.length > 0) {
      return healthCoach.chatHistory;
    }
    return [
      { 
        sender: 'agent', 
        text: `Hello${userProfile.name ? ` ${userProfile.name}` : ''}! I'm your Health Coach 🌱\n\nI'll help you track your daily wellness habits and build a healthier lifestyle. You can:\n\n• Tap the stat cards to quickly log water, sleep, exercise, or meals\n• Chat with me for tips and motivation\n• Set goals and track your streaks\n\nWhat would you like to focus on today?`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ];
  });
  
  // Save chat history when messages change
  useEffect(() => {
    updateHealthCoach(prev => ({
      ...prev,
      chatHistory: messages
    }));
  }, [messages]);
  
  // Update goals
  const setGoals = (newGoals) => {
    updateHealthCoach(prev => ({
      ...prev,
      goals: typeof newGoals === 'function' ? newGoals(prev.goals) : newGoals
    }));
  };
  
  // Handle logging
  const handleLog = (logEntry) => {
    updateHealthCoach(prev => {
      const newDailyLogs = { ...prev.dailyLogs };
      if (!newDailyLogs[todayKey]) {
        newDailyLogs[todayKey] = [];
      }
      newDailyLogs[todayKey] = [...newDailyLogs[todayKey], logEntry];
      
      return {
        ...prev,
        dailyLogs: newDailyLogs,
      };
    });
    
    const messages = {
      water: `Logged ${logEntry.value} glass${logEntry.value > 1 ? 'es' : ''} of water! 💧`,
      sleep: `Logged ${logEntry.value} hours of sleep! 😴`,
      exercise: `Logged ${logEntry.value} minutes of exercise! 🏃`,
      meal: `Logged ${logEntry.value}! 🍎`,
      weight: `Logged ${logEntry.value} lbs! ⚖️`,
    };
    
    setToast({ message: messages[logEntry.type] || 'Logged!', type: 'success' });
  };
  
  // Handle saving health settings
  const handleSaveSettings = (newSettings) => {
    updateHealthCoach(prev => ({
      ...prev,
      enabledMetrics: newSettings.enabledMetrics,
      targets: newSettings.targets,
    }));
    setToast({ message: 'Settings saved!', type: 'success' });
  };
  
  // Handle importing data
  const handleImportData = (importedData, mode) => {
    if (mode === 'replace') {
      // Replace all data
      updateHealthCoach(prev => ({
        ...prev,
        goals: importedData.goals || prev.goals,
        dailyLogs: importedData.dailyLogs || {},
        enabledMetrics: importedData.settings?.enabledMetrics || prev.enabledMetrics,
        targets: importedData.settings?.targets || prev.targets,
      }));
      setToast({ message: 'Data replaced successfully!', type: 'success' });
    } else {
      // Merge data
      updateHealthCoach(prev => {
        // Merge daily logs
        const mergedLogs = { ...prev.dailyLogs };
        for (const [date, logs] of Object.entries(importedData.dailyLogs || {})) {
          if (!mergedLogs[date]) {
            mergedLogs[date] = logs;
          } else {
            // Combine logs for the same date, avoiding duplicates by timestamp
            const existingTimestamps = new Set(mergedLogs[date].map(l => l.timestamp));
            const newLogs = logs.filter(l => !existingTimestamps.has(l.timestamp));
            mergedLogs[date] = [...mergedLogs[date], ...newLogs];
          }
        }
        
        // Merge goals (avoid duplicates by id)
        const existingGoalIds = new Set(prev.goals.map(g => g.id));
        const newGoals = (importedData.goals || []).filter(g => !existingGoalIds.has(g.id));
        
        return {
          ...prev,
          goals: [...prev.goals, ...newGoals],
          dailyLogs: mergedLogs,
        };
      });
      setToast({ message: 'Data merged successfully!', type: 'success' });
    }
  };
  
  // Handle adding goals
  const handleAddGoal = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    setToast({ message: 'Health goal added!', type: 'success' });
  };
  
  // Handle editing a goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowEditGoal(true);
  };
  
  // Handle saving edited goal
  const handleSaveGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    setToast({ message: 'Goal updated!', type: 'success' });
  };
  
  // Handle deleting a goal
  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    setToast({ message: 'Goal deleted', type: 'success' });
  };
  
  // Handle goal toggle
  const handleToggleGoal = (goalId) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g
    ));
  };
  
  // Handle chat
  const handleSendMessage = (text) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    setMessages(prev => [...prev, { sender: 'user', text, time: timeStr }]);
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateHealthResponse(text, healthCoach, todayLogs);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'agent', text: response, time: timeStr }]);
    }, 800 + Math.random() * 800);
  };
  
  const openLogModal = (type) => {
    setLogType(type);
    setShowLogModal(true);
  };
  
  // Generate a contextual productivity insight based on health data
  const getProductivityInsight = () => {
    if (todayStats.sleep >= 8) {
      return { type: 'positive', text: '💪 Well-rested! You should have great focus and energy today.', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (todayStats.sleep >= 7 && todayStats.sleep < 8) {
      return { type: 'neutral', text: '👍 Good sleep. You\'re set for a productive day.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (todayStats.sleep > 0 && todayStats.sleep < 6) {
      return { type: 'warning', text: '😴 Light sleep night. Consider easier tasks and extra breaks today.', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (todayStats.exercise >= 30) {
      return { type: 'positive', text: '🏃 Great workout! Exercise boosts cognitive function and mood.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (todayStats.water >= targets.water) {
      return { type: 'positive', text: '💧 Hydration goal met! This helps maintain concentration.', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    }
    return null;
  };
  
  const productivityInsight = getProductivityInsight();
  
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'stats', label: 'Stats' },
    { id: 'goals', label: 'Goals' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Health Coach</h2>
              <p className="text-emerald-100 text-sm">Building healthy habits together</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{todayStats.water}/{targets.water || 8}</p>
            <p className="text-xs text-emerald-100">Water</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{todayStats.sleep}h</p>
            <p className="text-xs text-emerald-100">Sleep</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-emerald-100">Day Streak</p>
          </div>
        </div>
      </div>
      
      {/* Productivity Insight Banner */}
      {productivityInsight && (
        <div className={`rounded-xl p-3 border ${productivityInsight.color} flex items-center gap-3`}>
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{productivityInsight.text}</p>
          <span className="text-xs opacity-70">→ Productivity</span>
        </div>
      )}
      
      {/* Tab Navigation */}
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Tab Content */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Quick Log Stats */}
          <div>
            <SectionHeader title="Today's Progress" icon={TrendingUp} action="Settings" onAction={() => setShowSettings(true)} />
            <div className="grid grid-cols-2 gap-3">
              {enabledMetrics.water && (
                <HealthStatCard
                  icon={Droplets}
                  label="Water"
                  value={todayStats.water}
                  target={targets.water || 8}
                  unit="glasses"
                  color="cyan"
                  onClick={() => openLogModal('water')}
                />
              )}
              {enabledMetrics.sleep && (
                <HealthStatCard
                  icon={Moon}
                  label="Sleep"
                  value={todayStats.sleep}
                  target={targets.sleep || 8}
                  unit="hours"
                  color="indigo"
                  onClick={() => openLogModal('sleep')}
                />
              )}
              {enabledMetrics.exercise && (
                <HealthStatCard
                  icon={Activity}
                  label="Exercise"
                  value={todayStats.exercise}
                  target={targets.exercise || 30}
                  unit="min"
                  color="orange"
                  onClick={() => openLogModal('exercise')}
                />
              )}
              {enabledMetrics.meal && (
                <HealthStatCard
                  icon={Apple}
                  label="Meals"
                  value={todayStats.meals}
                  target={targets.meal || 3}
                  unit="logged"
                  color="green"
                  onClick={() => openLogModal('meal')}
                />
              )}
              {enabledMetrics.weight && (
                <HealthStatCard
                  icon={Scale}
                  label={lastWeight && lastWeight.date !== todayKey ? `Weight (${new Date(lastWeight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : 'Weight'}
                  value={todayStats.weight || '—'}
                  target={targets.weight}
                  unit="lbs"
                  color="purple"
                  onClick={() => openLogModal('weight')}
                  isWeightGoal={true}
                />
              )}
            </div>
          </div>
          
          {/* Streak */}
          {streak > 0 && (
            <StreakBadge streak={streak} label={`day${streak !== 1 ? 's' : ''} streak!`} />
          )}
          
          {/* Recent Activity */}
          {todayLogs.length > 0 && (
            <div>
              <SectionHeader title="Today's Activity" icon={Clock} />
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                {todayLogs.slice(-5).reverse().map((log, i) => {
                  const icons = { water: Droplets, sleep: Moon, exercise: Activity, meal: Apple, weight: Scale };
                  const IconComponent = icons[log.type] || Circle;
                  const labels = { water: 'glasses of water', sleep: 'hours of sleep', exercise: 'min exercise', meal: '', weight: 'lbs' };
                  
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {log.type === 'meal' ? log.value : `${log.value} ${labels[log.type]}`}
                        </p>
                        {log.notes && <p className="text-xs text-gray-400">{log.notes}</p>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {todayLogs.length === 0 && (
            <EmptyState
              icon={Heart}
              title="Start tracking today"
              description="Tap any stat card above to log your first entry"
              color="emerald"
            />
          )}
        </div>
      )}
      
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* 7-Day Trends Chart */}
          <div>
            <SectionHeader title="7-Day Trends" icon={TrendingUp} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              {weekStats.daysLogged > 0 ? (
                <>
                  {/* Water & Sleep Chart */}
                  {(enabledMetrics.water || enabledMetrics.sleep) && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 font-medium mb-3">
                        {enabledMetrics.water && enabledMetrics.sleep ? 'Water & Sleep' : enabledMetrics.water ? 'Water Intake' : 'Sleep'}
                      </p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: '8px',
                                fontSize: '12px'
                              }} 
                            />
                            {enabledMetrics.water && (
                              <Area 
                                type="monotone" 
                                dataKey="water" 
                                stroke="#06b6d4" 
                                fill="url(#waterGradient)"
                                strokeWidth={2}
                                name="Water (glasses)"
                              />
                            )}
                            {enabledMetrics.sleep && (
                              <Area 
                                type="monotone" 
                                dataKey="sleep" 
                                stroke="#6366f1" 
                                fill="url(#sleepGradient)"
                                strokeWidth={2}
                                name="Sleep (hours)"
                              />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        {enabledMetrics.water && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-cyan-500" />
                            <span className="text-xs text-gray-500">Water</span>
                          </div>
                        )}
                        {enabledMetrics.sleep && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-xs text-gray-500">Sleep</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Exercise Bar Chart */}
                  {enabledMetrics.exercise && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-3">Exercise (minutes)</p>
                      <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: '8px',
                                fontSize: '12px'
                              }} 
                            />
                            <Bar 
                              dataKey="exercise" 
                              fill="#f97316" 
                              radius={[4, 4, 0, 0]}
                              name="Exercise (min)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No data to chart yet</p>
                  <p className="text-xs text-gray-400">Log some activities to see your trends</p>
                </div>
              )}
            </div>
          </div>
          
          {/* This Week Summary */}
          <div>
            <SectionHeader title="This Week" icon={Calendar} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-4">
                {enabledMetrics.water && (
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{weekStats.water}</p>
                    <p className="text-xs text-gray-500">glasses of water</p>
                  </div>
                )}
                {enabledMetrics.sleep && (
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{weekStats.sleep}</p>
                    <p className="text-xs text-gray-500">hours of sleep</p>
                  </div>
                )}
                {enabledMetrics.exercise && (
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{weekStats.exercise}</p>
                    <p className="text-xs text-gray-500">min exercise</p>
                  </div>
                )}
                {enabledMetrics.meal && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Apple className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{weekStats.meals}</p>
                    <p className="text-xs text-gray-500">meals logged</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">{weekStats.daysLogged} day{weekStats.daysLogged !== 1 ? 's' : ''} logged this week</p>
            </div>
          </div>
          
          {/* This Month */}
          <div>
            <SectionHeader title="This Month" icon={Calendar} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-4">
                {enabledMetrics.water && (
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{monthStats.water}</p>
                    <p className="text-xs text-gray-500">glasses of water</p>
                  </div>
                )}
                {enabledMetrics.sleep && (
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{monthStats.sleep}</p>
                    <p className="text-xs text-gray-500">hours of sleep</p>
                  </div>
                )}
                {enabledMetrics.exercise && (
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{monthStats.exercise}</p>
                    <p className="text-xs text-gray-500">min exercise</p>
                  </div>
                )}
                {enabledMetrics.meal && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Apple className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{monthStats.meals}</p>
                    <p className="text-xs text-gray-500">meals logged</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">{monthStats.daysLogged} day{monthStats.daysLogged !== 1 ? 's' : ''} logged this month</p>
            </div>
          </div>
          
          {/* Weight History */}
          {enabledMetrics.weight && (
            <div>
              <SectionHeader title="Weight Trend" icon={Scale} />
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {weightChartData.length > 1 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Current</p>
                        <p className="text-2xl font-bold text-gray-900">{lastWeight?.value || '—'} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Goal</p>
                        <p className="text-2xl font-bold text-purple-600">{targets.weight || 150} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                      </div>
                    </div>
                    
                    {/* Weight Line Chart */}
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" angle={-45} textAnchor="end" height={50} />
                          <YAxis 
                            tick={{ fontSize: 11 }} 
                            stroke="#9ca3af" 
                            domain={['dataMin - 5', 'dataMax + 5']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              fontSize: '12px'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#a855f7" 
                            strokeWidth={2}
                            dot={{ fill: '#a855f7', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            name="Weight (lbs)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="goal" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Goal"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-xs text-gray-500">Weight</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
                        <span className="text-xs text-gray-500">Goal</span>
                      </div>
                    </div>
                    
                    {/* Recent entries list */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-2">Recent entries:</p>
                      <div className="space-y-1">
                        {monthStats.weights.slice(-5).reverse().map((w, i) => (
                          <div key={i} className="flex justify-between items-center py-1.5 text-sm">
                            <span className="text-gray-500">{new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="font-medium text-gray-900">{w.value} lbs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : monthStats.weights.length === 1 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Current</p>
                        <p className="text-2xl font-bold text-gray-900">{lastWeight?.value || '—'} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Goal</p>
                        <p className="text-2xl font-bold text-purple-600">{targets.weight || 150} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                      </div>
                    </div>
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Log more weights to see your trend chart</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No weight entries yet</p>
                    <p className="text-xs text-gray-400">Log your weight to track progress over time</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Daily Averages */}
          <div>
            <SectionHeader title="Daily Averages (This Month)" icon={TrendingUp} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              {monthStats.daysLogged > 0 ? (
                <div className="space-y-3">
                  {enabledMetrics.water && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm text-gray-600">Water</span>
                      </div>
                      <span className="font-medium">{(monthStats.water / monthStats.daysLogged).toFixed(1)} glasses/day</span>
                    </div>
                  )}
                  {enabledMetrics.sleep && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-600">Sleep</span>
                      </div>
                      <span className="font-medium">{(monthStats.sleep / monthStats.daysLogged).toFixed(1)} hrs/day</span>
                    </div>
                  )}
                  {enabledMetrics.exercise && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Exercise</span>
                      </div>
                      <span className="font-medium">{(monthStats.exercise / monthStats.daysLogged).toFixed(0)} min/day</span>
                    </div>
                  )}
                  {enabledMetrics.meal && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Apple className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Meals</span>
                      </div>
                      <span className="font-medium">{(monthStats.meals / monthStats.daysLogged).toFixed(1)} meals/day</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No data yet this month</p>
                  <p className="text-xs text-gray-400">Start logging to see your averages</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Export/Import Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowExport(true)}
              className="py-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="py-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div>
            <SectionHeader title="Health Goals" icon={Target} action="Add Goal" onAction={() => setShowAddGoal(true)} />
            {goalsWithProgress.length > 0 ? (
              <div className="space-y-3">
                {goalsWithProgress.map(goal => <GoalCard key={goal.id} goal={goal} onToggle={!goal.autoTracked ? handleToggleGoal : undefined} onEdit={handleEditGoal} />)}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No health goals yet"
                description="Set goals to track your wellness journey"
                actionLabel="Add Health Goal"
                onAction={() => setShowAddGoal(true)}
                color="emerald"
              />
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'chat' && (
        <ChatInterface 
          agentName="Health Coach"
          agentColor="from-emerald-500 to-teal-500"
          messages={messages}
          onSendMessage={handleSendMessage}
          placeholder="Ask about nutrition, sleep, fitness..."
          isTyping={isTyping}
        />
      )}
      
      {/* Log Modal */}
      <LogHealthModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLog={handleLog}
        logType={logType}
      />
      
      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
        agentType="health"
      />
      
      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={showEditGoal}
        onClose={() => {
          setShowEditGoal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
      
      {/* Health Settings Modal */}
      <HealthSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{ enabledMetrics, targets }}
        onSave={handleSaveSettings}
      />
      
      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        healthData={healthCoach}
      />
      
      {/* Import Data Modal */}
      <ImportDataModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImportData}
      />
      
      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

const FinancialAdvisorView = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3">
        <DollarSign className="w-8 h-8" />
        <div>
          <h2 className="text-xl font-bold">Financial Advisor</h2>
          <p className="text-amber-100 text-sm">Coming soon with full functionality</p>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
      <DollarSign className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="font-semibold text-gray-900 mb-2">Financial Advisor Agent</h3>
      <p className="text-gray-500 text-sm">This agent will include goal tracking, risk profiling, budget management, and investment insights.</p>
    </div>
  </div>
);

const LearningTutorView = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8" />
        <div>
          <h2 className="text-xl font-bold">Learning Tutor</h2>
          <p className="text-purple-100 text-sm">Coming soon with full functionality</p>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
      <BookOpen className="w-12 h-12 text-purple-500 mx-auto mb-4" />
      <h3 className="font-semibold text-gray-900 mb-2">Learning Tutor Agent</h3>
      <p className="text-gray-500 text-sm">This agent will include personalized curriculums, interactive lessons, study scheduling, and topic recommendations.</p>
    </div>
  </div>
);

// ============================================
// DASHBOARD VIEW
// ============================================

const DashboardView = ({ onNavigate }) => {
  const { personalAssistant, healthCoach, userProfile } = useAppData();
  
  // Get today's date key for health data
  const getLocalDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const todayKey = getLocalDateKey(new Date());
  const todayLogs = healthCoach.dailyLogs?.[todayKey] || [];
  
  // Calculate health stats for today
  const todayHealthStats = {
    water: todayLogs.filter(l => l.type === 'water').reduce((sum, l) => sum + l.value, 0),
    sleep: todayLogs.find(l => l.type === 'sleep')?.value || 0,
    exercise: todayLogs.filter(l => l.type === 'exercise').reduce((sum, l) => sum + l.value, 0),
    meals: todayLogs.filter(l => l.type === 'meal').length,
  };
  
  const targets = healthCoach.targets || { water: 8, sleep: 8, exercise: 30, meal: 3 };
  const enabledMetrics = healthCoach.enabledMetrics || { water: true, sleep: true, exercise: true, meal: true };
  
  // Calculate overall health score for today (percentage of targets met)
  const calculateHealthScore = () => {
    let totalProgress = 0;
    let metricsCount = 0;
    
    if (enabledMetrics.water) {
      totalProgress += Math.min((todayHealthStats.water / targets.water) * 100, 100);
      metricsCount++;
    }
    if (enabledMetrics.sleep) {
      totalProgress += Math.min((todayHealthStats.sleep / targets.sleep) * 100, 100);
      metricsCount++;
    }
    if (enabledMetrics.exercise) {
      totalProgress += Math.min((todayHealthStats.exercise / targets.exercise) * 100, 100);
      metricsCount++;
    }
    if (enabledMetrics.meal) {
      totalProgress += Math.min((todayHealthStats.meals / targets.meal) * 100, 100);
      metricsCount++;
    }
    
    return metricsCount > 0 ? Math.round(totalProgress / metricsCount) : 0;
  };
  
  const healthScore = calculateHealthScore();
  
  // Generate cross-agent insights
  const generateInsights = () => {
    const insights = [];
    
    // Sleep affecting productivity
    if (enabledMetrics.sleep && todayHealthStats.sleep > 0) {
      if (todayHealthStats.sleep >= 7) {
        insights.push({
          type: 'positive',
          icon: Sparkles,
          text: `Great sleep last night (${todayHealthStats.sleep}h)! You should have good energy for your tasks today.`,
          agents: ['health', 'personal'],
        });
      } else if (todayHealthStats.sleep < 6) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          text: `Only ${todayHealthStats.sleep}h of sleep. Consider lighter tasks today and an earlier bedtime.`,
          agents: ['health', 'personal'],
        });
      }
    }
    
    // Exercise boosting energy
    if (enabledMetrics.exercise && todayHealthStats.exercise >= 30) {
      insights.push({
        type: 'positive',
        icon: Activity,
        text: `${todayHealthStats.exercise} min of exercise today! This can boost focus and reduce stress.`,
        agents: ['health', 'personal'],
      });
    }
    
    // Hydration reminder
    if (enabledMetrics.water && todayHealthStats.water < targets.water / 2) {
      const hour = new Date().getHours();
      if (hour >= 12) {
        insights.push({
          type: 'reminder',
          icon: Droplets,
          text: `Only ${todayHealthStats.water}/${targets.water} glasses of water so far. Staying hydrated helps concentration!`,
          agents: ['health'],
        });
      }
    }
    
    // Goals completion celebration
    const completedGoals = [...personalAssistant.goals, ...healthCoach.goals].filter(g => g.completed).length;
    const totalGoals = personalAssistant.goals.length + healthCoach.goals.length;
    if (completedGoals > 0 && completedGoals === totalGoals && totalGoals > 0) {
      insights.push({
        type: 'celebration',
        icon: CheckCircle2,
        text: `Amazing! All ${totalGoals} goals completed across your assistants! 🎉`,
        agents: ['personal', 'health'],
      });
    } else if (completedGoals > 0) {
      insights.push({
        type: 'positive',
        icon: Target,
        text: `${completedGoals} of ${totalGoals} goals completed. Keep up the momentum!`,
        agents: ['personal', 'health'],
      });
    }
    
    // Pending reminders
    const urgentReminders = personalAssistant.reminders.filter(r => r.urgent);
    if (urgentReminders.length > 0) {
      insights.push({
        type: 'urgent',
        icon: Bell,
        text: `${urgentReminders.length} urgent reminder${urgentReminders.length > 1 ? 's' : ''} need${urgentReminders.length === 1 ? 's' : ''} attention.`,
        agents: ['personal'],
      });
    }
    
    // Drafts ready
    if (personalAssistant.drafts.length > 0) {
      insights.push({
        type: 'action',
        icon: Mail,
        text: `${personalAssistant.drafts.length} email draft${personalAssistant.drafts.length > 1 ? 's' : ''} ready for your review.`,
        agents: ['personal'],
      });
    }
    
    return insights.slice(0, 4);
  };
  
  const insights = generateInsights();
  
  // Agent cards with real stats
  const agents = [
    { 
      id: 'personal', 
      name: 'Personal Assistant', 
      icon: User, 
      color: 'from-blue-500 to-indigo-500', 
      stats: [
        { label: 'Drafts', value: personalAssistant.drafts.length },
        { label: 'Reminders', value: personalAssistant.reminders.length },
      ],
      status: personalAssistant.drafts.length > 0 ? `${personalAssistant.drafts.length} drafts ready` : 'All caught up',
      active: true 
    },
    { 
      id: 'health', 
      name: 'Health Coach', 
      icon: Heart, 
      color: 'from-emerald-500 to-teal-500', 
      stats: [
        { label: 'Today', value: `${healthScore}%` },
        { label: 'Logged', value: todayLogs.length },
      ],
      status: healthScore >= 80 ? 'On track!' : healthScore >= 50 ? 'Keep going' : 'Get started',
      active: true 
    },
    { id: 'financial', name: 'Financial Advisor', icon: DollarSign, color: 'from-amber-500 to-orange-500', stats: [], status: 'Coming soon', active: false },
    { id: 'learning', name: 'Learning Tutor', icon: BookOpen, color: 'from-purple-500 to-pink-500', stats: [], status: 'Coming soon', active: false },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  const getInsightStyle = (type) => {
    switch (type) {
      case 'positive':
      case 'celebration':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'reminder':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'action':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with overview */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">{greeting()}{userProfile.name ? `, ${userProfile.name}` : ''}! 👋</h2>
        <p className="text-gray-300 mt-2">Here's your unified view across all assistants</p>
        
        {/* Quick Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{healthScore}%</p>
            <p className="text-xs text-gray-300">Health Score</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{personalAssistant.goals.filter(g => g.completed).length + healthCoach.goals.filter(g => g.completed).length}</p>
            <p className="text-xs text-gray-300">Goals Done</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{personalAssistant.reminders.length}</p>
            <p className="text-xs text-gray-300">Reminders</p>
          </div>
        </div>
      </div>
      
      {/* Cross-Agent Insights */}
      {insights.length > 0 && (
        <div>
          <SectionHeader title="Insights For You" icon={Sparkles} />
          <div className="space-y-3">
            {insights.map((insight, i) => {
              const IconComponent = insight.icon;
              return (
                <div 
                  key={i} 
                  className={`rounded-xl p-4 border ${getInsightStyle(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{insight.text}</p>
                      <div className="flex gap-2 mt-2">
                        {insight.agents.map(agent => (
                          <span key={agent} className="text-xs opacity-70 capitalize">{agent}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Cards */}
      <div>
        <SectionHeader title="Your Assistants" />
        <div className="grid grid-cols-2 gap-4">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => agent.active && onNavigate(agent.id)}
              className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left transition-all ${
                agent.active ? 'hover:shadow-md hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center mb-3`}>
                <agent.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{agent.name}</h3>
              
              {agent.stats.length > 0 ? (
                <div className="flex gap-3 mt-2">
                  {agent.stats.map((stat, i) => (
                    <div key={i}>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">{agent.status}</p>
              )}
              
              {agent.active && (
                <div className="mt-3 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500">{agent.status}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Today's Health at a Glance (if enabled) */}
      {(enabledMetrics.water || enabledMetrics.sleep || enabledMetrics.exercise) && (
        <div>
          <SectionHeader 
            title="Today's Health" 
            icon={Heart} 
            action="Details" 
            onAction={() => onNavigate('health')} 
          />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-4 gap-2">
              {enabledMetrics.water && (
                <div className="text-center p-2">
                  <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{todayHealthStats.water}</p>
                  <p className="text-xs text-gray-400">/{targets.water}</p>
                </div>
              )}
              {enabledMetrics.sleep && (
                <div className="text-center p-2">
                  <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{todayHealthStats.sleep}</p>
                  <p className="text-xs text-gray-400">/{targets.sleep}h</p>
                </div>
              )}
              {enabledMetrics.exercise && (
                <div className="text-center p-2">
                  <Activity className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{todayHealthStats.exercise}</p>
                  <p className="text-xs text-gray-400">/{targets.exercise}m</p>
                </div>
              )}
              {enabledMetrics.meal && (
                <div className="text-center p-2">
                  <Apple className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{todayHealthStats.meals}</p>
                  <p className="text-xs text-gray-400">/{targets.meal}</p>
                </div>
              )}
            </div>
            
            {/* Overall progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Today's Progress</span>
                <span>{healthScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    healthScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    healthScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Target, label: 'Add Goal', action: () => onNavigate('personal'), color: 'text-blue-500' },
            { icon: Droplets, label: 'Log Water', action: () => onNavigate('health'), color: 'text-cyan-500' },
            { icon: MessageCircle, label: 'Chat', action: () => onNavigate('personal'), color: 'text-indigo-500' },
            { icon: Calendar, label: 'Schedule', action: () => onNavigate('personal'), color: 'text-purple-500' },
          ].map((action, i) => (
            <button 
              key={i} 
              onClick={action.action}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <action.icon className={`w-5 h-5 ${action.color}`} />
              <span className="text-xs text-gray-600">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SETTINGS PANEL
// ============================================

const SettingsPanel = ({ onClose, onRestartOnboarding }) => {
  const { userProfile, setUserProfile, clearAllData, syncStatus } = useAppData();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [localProfile, setLocalProfile] = useState(userProfile);

  const handleSave = () => {
    setUserProfile(localProfile);
    onClose();
  };

  const handleReset = () => {
    if (showConfirmReset) {
      clearAllData();
    } else {
      setShowConfirmReset(true);
    }
  };
  
  const handleRestartOnboarding = () => {
    setUserProfile({ ...userProfile, onboardingComplete: false });
    onClose();
    if (onRestartOnboarding) onRestartOnboarding();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={localProfile.email}
              onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">Data Storage</p>
                <p className="text-sm text-gray-500">All data is stored locally on your device</p>
              </div>
              <SyncIndicator />
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleRestartOnboarding}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-700">Restart Setup Wizard</p>
                  <p className="text-xs text-blue-600">Go through onboarding again</p>
                </div>
                <RefreshCw className="w-4 h-4 text-blue-500" />
              </button>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Reset All Data</p>
                    <p className="text-xs text-gray-500">Delete all preferences and history</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      showConfirmReset 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {showConfirmReset ? 'Confirm Reset' : 'Reset'}
                  </button>
                </div>
                {showConfirmReset && (
                  <p className="text-xs text-red-500 mt-2">Click again to confirm. This cannot be undone.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function MyAssistantAppInner() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { userProfile } = useAppData();
  
  // Check if onboarding is needed
  useEffect(() => {
    if (!userProfile.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [userProfile.onboardingComplete]);

  const navItems = [
    { id: 'dashboard', name: 'Home', icon: Home },
    { id: 'personal', name: 'Personal', icon: User },
    { id: 'health', name: 'Health', icon: Heart },
    { id: 'financial', name: 'Finance', icon: DollarSign },
    { id: 'learning', name: 'Learning', icon: BookOpen },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'personal': return <PersonalAssistantView />;
      case 'health': return <HealthCoachView />;
      case 'financial': return <FinancialAdvisorView />;
      case 'learning': return <LearningTutorView />;
      default: return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  const getTitle = () => {
    const view = navItems.find(n => n.id === currentView);
    return currentView === 'dashboard' ? 'My Assistant' : view?.name || 'My Assistant';
  };
  
  // Show onboarding for new users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentView !== 'dashboard' && (
              <button onClick={() => setCurrentView('dashboard')} className="p-1 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{getTitle()}</h1>
              {userProfile.name && currentView === 'dashboard' && (
                <p className="text-xs text-gray-500">Welcome back, {userProfile.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SyncIndicator />
            <button className="p-2 hover:bg-gray-50 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-50 rounded-full"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  currentView === item.id 
                    ? 'text-blue-500' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)} 
          onRestartOnboarding={() => setShowOnboarding(true)}
        />
      )}
    </div>
  );
}

export default function MyAssistantApp() {
  return (
    <AppDataProvider>
      <MyAssistantAppInner />
    </AppDataProvider>
  );
}
