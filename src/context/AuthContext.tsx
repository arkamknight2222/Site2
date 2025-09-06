import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
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
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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
        // Update profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone,
            first_name: userData.firstName,
            last_name: userData.lastName,
            age: userData.age ? parseInt(userData.age) : null,
            gender: userData.gender,
            is_veteran: userData.isVeteran || false,
            is_citizen: userData.isCitizen || false,
            highest_degree: userData.highestDegree,
            has_criminal_record: userData.hasCriminalRecord || false,
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

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

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        // Update in database
        const { error } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone,
            first_name: userData.firstName,
            last_name: userData.lastName,
            age: userData.age ? parseInt(userData.age) : null,
            gender: userData.gender,
            is_veteran: userData.isVeteran,
            is_citizen: userData.isCitizen,
            highest_degree: userData.highestDegree,
            has_criminal_record: userData.hasCriminalRecord,
            profile_picture: userData.profilePicture,
            bio: userData.bio,
            skills: userData.skills,
            points: userData.points,
            is_employer: userData.isEmployer,
            is_verified: userData.isVerified,
            company_name: userData.companyName,
            company_id: userData.companyId,
            company_location: userData.companyLocation,
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile:', error);
          return;
        }

        // Update local state
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
      }
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