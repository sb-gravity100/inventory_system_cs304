import { useState } from "react";
import { TextInput } from "react-native-paper";

export default function PasswordInput({ 
   value, 
   onChangeText, 
   placeholder = "Enter password",
   style,
   ...props 
}) {
   const [secureTextEntry, setSecureTextEntry] = useState(true);

   return (
      <TextInput
         style={style}
         placeholder={placeholder}
         value={value}
         onChangeText={onChangeText}
         secureTextEntry={secureTextEntry}
         autoCapitalize="none"
         autoCorrect={false}
         right={
            <TextInput.Icon
               icon={secureTextEntry ? "eye-off" : "eye"}
               onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
         }
         {...props}
      />
   );
}