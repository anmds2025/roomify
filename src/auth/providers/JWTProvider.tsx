/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import { type AuthModel, type UserModel } from '@/auth';

export const GET_USER_BY_ACCESSTOKEN_URL = `/user-admin`;
export const LOGIN_URL = `/user/login`;
export const REGISTER_URL = `/register`;
export const REQUEST_PASSWORD_URL = `/forgotpassword`;

interface AuthContextProps {
  isLoading: boolean;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string, phone: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  requestPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updatedFields: Partial<Pick<UserModel, "fullname">>) => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  // Verity user session and validate bearer authentication
  const verify = async () => {
    if (currentUser) {
      try {
        const {data} = await getUser();
        setCurrentUser(currentUser);
        if(data)
        {
          setCurrentUser(data)
        }
      } catch (error) {
        setCurrentUser(undefined);
      }
    }
  };

  useEffect(() => {
    verify().finally(() => {
      // delay for layout initialization
      setLoading(false);
    });
  }, []);

  const getUser = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  };



  // Login user with email and password
  const login = async (phone : string, email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('password', password);
      try {
        const { data: user } = await axios.post<UserModel>(
          LOGIN_URL,
          formData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        localStorage.setItem('isLogin', 'true');
      } catch (error) {
        console.error('Login error:', error);
      }
    } catch (error) {
      setCurrentUser(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  // Server should return object => { result: boolean } (Is Email in DB)
  const requestPassword = async (email: string) => {
    await axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
      email
    });
  };

  // Delete auth local storage and resets current user state
  const logout = () => {
    setCurrentUser(undefined);
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    localStorage.removeItem('isLogin');
  };

  const updateCurrentUser = (updatedFields: Partial<Pick<UserModel, "fullname">>) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        ...updatedFields,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        currentUser,
        setCurrentUser,
        login,
        requestPassword,
        logout,
        verify,
        updateCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
