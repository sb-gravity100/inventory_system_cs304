import { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { LightTheme, DarkTheme } from "./theme.js";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
   const systemScheme = useColorScheme(); // 'light' or 'dark'
   const [overrideScheme, setOverrideScheme] = useState(null);

   const toggleTheme = () => {
      setOverrideScheme((prev) => {
         const current = prev || systemScheme;
         return current === "dark" ? "light" : "dark";
      });
   };

   const theme = useMemo(() => {
      const scheme = overrideScheme || systemScheme;
      return scheme === "dark" ? DarkTheme : LightTheme;
   }, [systemScheme, overrideScheme]);

   return (
      <ThemeContext.Provider value={{ theme, setOverrideScheme, toggleTheme }}>
         {children}
      </ThemeContext.Provider>
   );
};

export const useTheme = () => useContext(ThemeContext);
