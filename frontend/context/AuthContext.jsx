import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();
const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [authState, setAuthState] = useState({
      token: null,
      isAuth: false,
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      console.log(api_url)
      const checkAuthStatus = async () => {
         try {
            const token = await SecureStore.getItemAsync("jwt");
            if (token) {
               const response = await axios.get(api_url + "/auth/me", {
                  headers: { Authorization: `Bearer ${token}` },
               });
               setUser(response.data);
               setAuthState({ token, isAuth: true });
            }
         } catch (error) {
            console.error("Error checking auth status:", error);
         } finally {
            setLoading(false);
         }
      };

      checkAuthStatus();
   }, []);

   const login = async (username, password) => {
      try {
         const response = await axios.post(api_url + "/auth/login", {
            username,
            password,
         });
         const { token, user } = response.data;
         await SecureStore.setItemAsync("jwt", token);
         setUser(user);
         setAuthState({ token, isAuth: true });
      } catch (error) {
         console.error("Login error:", error);
         throw error;
      }
   };

   const logout = async () => {
      await SecureStore.deleteItemAsync("jwt");
      setUser(null);
      setAuthState({ token: null, isAuth: false });
   };

   const value = { user, isLoading: loading, login, logout, authState };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
