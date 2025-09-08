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
        salary: { min: 120000, max: 180000 },
        description: 'We are looking for an experienced React developer to join our growing team. You will be responsible for building scalable web applications using modern React patterns and best practices.',
        requirements: [
          '5+ years of React experience',
          'Strong TypeScript skills',
          'Experience with state management (Redux/Zustand)',
          'Knowledge of testing frameworks (Jest, React Testing Library)',
          'Familiarity with modern build tools (Vite, Webpack)'
        ],
        experienceLevel: 'senior',
        educationLevel: 'bachelor',
        minimumPoints: 100,
        postedDate: '2025-01-08',
        featured: true,
      },
      {
        id: 'mock-2',
        title: 'Frontend Developer',
        company: 'StartupX',
        location: 'Remote',
        type: 'full-time',
        salary: { min: 80000, max: 120000 },
        description: 'Join our innovative startup as a Frontend Developer. Work with cutting-edge technologies and help shape the future of our product.',
        requirements: [
          '3+ years of JavaScript experience',
          'React or Vue.js experience',
          'CSS/SCSS proficiency',
          'Responsive design skills',
          'Git version control'
        ],
        experienceLevel: 'mid',
        educationLevel: 'bachelor',
        minimumPoints: 50,
        postedDate: '2025-01-07',
        featured: false,
      },
      {
        id: 'mock-3',
        title: 'Junior Web Developer',
        company: 'Digital Agency',
        location: 'New York, NY',
        type: 'full-time',
        salary: { min: 60000, max: 80000 },
        description: 'Perfect opportunity for a junior developer to grow their skills in a supportive environment. You will work on various client projects and learn from experienced developers.',
        requirements: [
          '1+ years of web development experience',
          'HTML, CSS, JavaScript knowledge',
          'Basic React or Angular experience',
          'Willingness to learn',
          'Strong communication skills'
        ],
        experienceLevel: 'entry',
        educationLevel: 'bachelor',
        minimumPoints: 25,
        postedDate: '2025-01-06',
        featured: false,
      },
    ];
  };

  const getMockEvents = (): Job[] => {
    return [
      {
        id: 'mock-event-1',
        title: 'Tech Career Fair 2025',
        company: 'City Career Center',
        location: 'Los Angeles Convention Center',
        type: 'full-time',
        salary: { min: 0, max: 0 },
        description: 'Join us for the biggest tech career fair of the year! Meet with top employers, attend workshops, and network with industry professionals.',
        requirements: [
          'Bring multiple copies of your resume',
          'Business professional attire',
          'Portfolio or work samples (optional)',
          'Networking mindset'
        ],
        experienceLevel: 'entry',
        educationLevel: 'high-school',
        minimumPoints: 0,
        postedDate: '2025-01-05',
        isEvent: true,
        eventDate: '2025-01-25',
        requiresApplication: false,
        featured: true,
      },
      {
        id: 'mock-event-2',
        title: 'Senior Developer Networking Mixer',
        company: 'Tech Professionals Network',
        location: 'San Francisco, CA',
        type: 'part-time',
        salary: { min: 0, max: 0 },
        description: 'Exclusive networking event for senior developers. Connect with CTOs, lead engineers, and other senior professionals in an intimate setting.',
        requirements: [
          'Minimum 5 years experience',
          'Current or recent senior role',
          'Business cards',
          'Professional attire'
        ],
        experienceLevel: 'senior',
        educationLevel: 'bachelor',
        minimumPoints: 75,
        postedDate: '2025-01-04',
        isEvent: true,
        eventDate: '2025-01-20',
        requiresApplication: true,
        featured: false,
      },
    ];
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