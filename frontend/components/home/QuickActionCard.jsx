import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Subtitle, Caption } from "../ui";
import { useTheme } from "../ThemeProvider";
import Card from "../ui/Card";

export default function QuickActionCard({ icon, title, description, onPress }) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      cardContent: {
         flexDirection: "row",
         alignItems: "center",
      },
      menuIcon: {
         fontSize: 32,
         marginRight: 16,
      },
      menuContent: {
         flex: 1,
      },
   });

   return (
      <TouchableOpacity onPress={onPress}>
         <Card style={{ borderLeftWidth: 4, borderLeftColor: theme.secondary }}>
            <View style={styles.cardContent}>
               <Text style={styles.menuIcon}>{icon}</Text>
               <View style={styles.menuContent}>
                  <Subtitle>{title}</Subtitle>
                  <Caption>{description}</Caption>
               </View>
            </View>
         </Card>
      </TouchableOpacity>
   );
}
