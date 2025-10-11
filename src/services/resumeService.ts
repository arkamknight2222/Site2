import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { resumeService } from '../services/resumeService';

// Add immediate debugging
console.log('[AuthContext] Module loaded, supabase client:', supabase);
console.log('[AuthContext] Environment check:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
});

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  isVeteran?: boolean;
  isCitizen?: boolean;
  highestDegree?: string;
  hasCriminalRecord?: boolean;
  resumeUrl?: string;
  profilePicture?: string;
  points: number;
  isEmployer?: boolean;
  companyName?: string;
  companyId?: string;
  companyLocation?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  isVeteran?: boolean;
  isCitizen?: boolean;
  highestDegree?: string;
  hasCriminalRecord?: boolean;
  resumeFile?: File;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] useEffect started - initializing auth');
    // Check for existing Supabase session
    const getSession = async () => {
      console.log('[AuthContext] getSession started');
      try {
        console.log('[AuthContext] Calling supabase.auth.getSession()');
        const { data: { session }, error } = await supabase.auth.getSession();
        // Check if it's a network error (Failed to fetch)
        if (error.message && error.message.includes('Failed to fetch')) {
          console.log('[AuthContext] Network error detected, using offline mode');
        const { data: remainingResumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (remainingResumes && remainingResumes.length > 0) {
          await this.setDefaultResume(remainingResumes[0].id, userId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error bulk deleting resumes:', error);
      return false;
    }
  },

  async bulkMoveResumes(resumeIds: string[], targetFolderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ folder_id: targetFolderId })
        .in('id', resumeIds);

      if (error) {
        console.error('Error bulk moving resumes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error bulk moving resumes:', error);
      return false;
    }
  },
        }
        
        if (session?.user) {
          console.log('[AuthContext] Session found, loading user profile for:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          console.log('[AuthContext] No session found');
        }
      } catch (error) {
        console.error('[AuthContext] Exception in getSession:', error);
      } finally {
        console.log('[AuthContext] Setting loading to false');
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    console.log('[AuthContext] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', { event, session: session?.user?.id });
      if (session?.user) {
        console.log('[AuthContext] Auth change - loading profile for:', session.user.id);
        await loadUserProfile(session.user.id);
      } else {
        console.log('[AuthContext] Auth change - clearing user');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    console.log('[AuthContext] loadUserProfile started for userId:', userId);
    try {
      console.log('[AuthContext] Fetching profile from database');
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      console.log('[AuthContext] Profile fetch response:', { profile, error });

      if (error) {
        console.error('[AuthContext] Error loading profile:', error);
        console.log('[AuthContext] Profile error details:', error.message, error.code);
        
        // Check if it's a network error (Failed to fetch)
        if (error.message && error.message.includes('Failed to fetch')) {
          console.log('[AuthContext] Network error detected, using offline mode');
      
      // Create a mock profile with default values
      const offlineProfile: User = {
        id: userId,
        email: authUser?.email || 'user@example.com',
        phone: '',
        firstName: 'Demo',
        lastName: 'User',
        age: '',
        gender: '',
        isVeteran: false,
        isCitizen: true,
        highestDegree: '',
        hasCriminalRecord: false,
        profilePicture: '',
        points: 150, // Give extra points for demo
        isEmployer: false,
        isVerified: true, // Allow posting in demo mode
        companyName: '',
        companyId: '',
        companyLocation: '',
      };
      
      console.log('[AuthContext] Setting offline user profile:', offlineProfile);
      setUser(offlineProfile);
      console.log('[AuthContext] Setting loading to false after offline profile creation');
      setLoading(false);
      
      // Show notification about offline mode
      setTimeout(() => {
        console.log('[AuthContext] Showing offline mode notification');
        // You could show a toast notification here
      }, 1000);
      
    } catch (error) {
      console.error('[AuthContext] Error in createOfflineProfile:', error);
      console.log('[AuthContext] Setting loading to false due to offline profile error');
      setLoading(false);
    }
  };
  
        }
        
        // For other errors, set loading to false
        console.log('[AuthContext] Setting loading to false due to profile error');
        setLoading(false);
        return;
      }

      if (profile) {
        console.log('[AuthContext] Profile found, creating user object');
        const userData: User = {
          id: profile.id,
          email: profile.email,
          phone: profile.phone,
          firstName: profile.first_name,
          lastName: profile.last_name,
          age: profile.age?.toString(),
          gender: profile.gender,
          isVeteran: profile.is_veteran,
          isCitizen: profile.is_citizen,
          highestDegree: profile.highest_degree,
          hasCriminalRecord: profile.has_criminal_record,
          profilePicture: profile.profile_picture,
          points: profile.points,
          isEmployer: profile.is_employer,
          isVerified: profile.is_verified,
          companyName: profile.company_name,
          companyId: profile.company_id,
          companyLocation: profile.company_location,
        };
        console.log('[AuthContext] Setting user data:', userData);
        setUser(userData);
        console.log('[AuthContext] Setting loading to false after successful profile load');
        setLoading(false);
      } else {
        console.log('[AuthContext] No profile data found');
        console.log('[AuthContext] Setting loading to false - no profile data');
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error loading user profile:', error);
      console.log('[AuthContext] Exception in loadUserProfile:', error);
      console.log('[AuthContext] Setting loading to false due to exception');
      setLoading(false);
    }
  };
  
  const createMissingProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] Creating missing profile for user:', userId);
      
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('[AuthContext] No auth user found, cannot create profile');
        setLoading(false);
        return;
      }
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: authUser.email || '',
          points: 50,
          is_employer: false,
          is_verified: false,
          is_veteran: false,
          is_citizen: false,
          has_criminal_record: false,
        });
      
      if (createError) {
        console.error('[AuthContext] Error creating profile:', createError);
        setLoading(false);
        return;
      }
      
      console.log('[AuthContext] Profile created successfully, loading it');
      await loadUserProfile(userId);
      
    } catch (error) {
      console.error('[AuthContext] Error in createMissingProfile:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('[AuthContext] Starting registration process');
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      if (data.user) {
        console.log('[AuthContext] Auth user created, creating profile');
        
        // Create profile entry in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            phone: userData.phone,
            first_name: userData.firstName,
            last_name: userData.lastName,
            age: userData.age ? parseInt(userData.age) : null,
            gender: userData.gender,
            is_veteran: userData.isVeteran || false,
            is_citizen: userData.isCitizen || false,
            highest_degree: userData.highestDegree,
            has_criminal_record: userData.hasCriminalRecord || false,
            points: 50, // Starting points
          });

        if (profileError) {
          console.error('[AuthContext] Error creating profile:', profileError);
          return false;
        }

        console.log('[AuthContext] Profile created successfully');

        // Add welcome bonus to points history
        console.log('[AuthContext] Adding welcome bonus to points history');
        await supabase
          .from('points_history')
          .insert({
            user_id: data.user.id,
            type: 'earned',
            amount: 50,
            description: 'Welcome bonus for new members',
            category: 'bonus',
          });

        console.log('[AuthContext] Loading user profile after registration');
        await loadUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}