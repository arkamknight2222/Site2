import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { resumeService } from '../services/resumeService';

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
        console.log('[AuthContext] getSession response:', { session, error });
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          return;
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[AuthContext] Profile fetch response:', { profile, error });

      if (error) {
        console.error('Error loading profile:', error);
        console.log('[AuthContext] Profile error details:', error.message, error.code);
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
      } else {
        console.log('[AuthContext] No profile data found');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      console.log('[AuthContext] Exception in loadUserProfile:', error);
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
        // Add welcome bonus to points history
        await supabase
          .from('points_history')
          .insert({
            user_id: data.user.id,
            type: 'earned',
            amount: 50,
            description: 'Welcome bonus for new members',
            category: 'bonus',
          });

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