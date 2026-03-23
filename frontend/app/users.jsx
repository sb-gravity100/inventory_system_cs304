import {
   View,
   TouchableOpacity,
   ScrollView,
   Alert,
   Modal,
} from "react-native";
import { Title, Subtitle, Body, Caption, Loading } from "../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/ui/Header";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/PasswordInput";
import Card from "../components/ui/Card";
import Dropdown from "../components/ui/Dropdown";
import FormField from "../components/ui/FormField";
const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function UsersScreen() {
   const { theme } = useTheme();
   const { authState, user } = useAuth();
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [modalVisible, setModalVisible] = useState(false);
   const [editModalVisible, setEditModalVisible] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   const [isModified, setIsModified] = useState(false);

   // Form states
   const [newUsername, setNewUsername] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [newRole, setNewRole] = useState("staff");

   // Edit form states
   const [editUsername, setEditUsername] = useState("");
   const [editRole, setEditRole] = useState("");
   const [editPassword, setEditPassword] = useState("");

   const fetchUsers = async () => {
      try {
         const response = await axios.get(`${api_url}/auth/admin/list-users`, {
            headers: { Authorization: `Bearer ${authState.token}` },
         });
         setUsers(response.data);
      } catch (error) {
         Alert.alert("Error", "Failed to fetch users");
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const handleCreateUser = async () => {
      if (!newUsername || !newPassword) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }

      try {
         await axios.post(
            `${api_url}/auth/admin-create-user`,
            {
               username: newUsername,
               password: newPassword,
               role: newRole,
            },
            {
               headers: { Authorization: `Bearer ${authState.token}` },
            },
         );
         Alert.alert("Success", "User created successfully");
         setModalVisible(false);
         setNewUsername("");
         setNewPassword("");
         setNewRole("staff");
         fetchUsers();
      } catch (error) {
         Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to create user",
         );
      }
   };

   const handleUpdateUser = async () => {
      if (!editUsername) {
         Alert.alert("Error", "Username cannot be empty");
         return;
      }

      try {
         // Update user details
         await axios.post(
            `${api_url}/auth/admin-update-user`,
            {
               username: selectedUser.username,
               newUsername: editUsername,
               newRole: editRole,
            },
            {
               headers: { Authorization: `Bearer ${authState.token}` },
            },
         );

         // Update password if provided
         if (editPassword) {
            await axios.post(
               `${api_url}/auth/admin-change-password`,
               {
                  username: editUsername,
                  newPassword: editPassword,
               },
               {
                  headers: { Authorization: `Bearer ${authState.token}` },
               },
            );
         }

         Alert.alert("Success", "User updated successfully");
         setEditModalVisible(false);
         setSelectedUser(null);
         setEditUsername("");
         setEditRole("");
         setEditPassword("");
         fetchUsers();
      } catch (error) {
         Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to update user",
         );
      }
   };

   const handleDeleteUser = async (username) => {
      Alert.alert(
         "Confirm Delete",
         `Are you sure you want to delete user "${username}"?`,
         [
            { text: "Cancel", style: "cancel" },
            {
               text: "Delete",
               style: "destructive",
               onPress: async () => {
                  try {
                     await axios.post(
                        `${api_url}/auth/admin-delete-user`,
                        { username },
                        {
                           headers: {
                              Authorization: `Bearer ${authState.token}`,
                           },
                        },
                     );
                     Alert.alert("Success", "User deleted successfully");
                     fetchUsers();
                  } catch (error) {
                     Alert.alert(
                        "Error",
                        error.response?.data?.message ||
                           "Failed to delete user",
                     );
                  }
               },
            },
         ],
      );
   };

   const openEditModal = (userItem) => {
      setSelectedUser(userItem);
      setEditUsername(userItem.username);
      setEditRole(userItem.role);
      setEditPassword("");
      setIsModified(false); // Add this line
      setEditModalVisible(true);
   };

   useEffect(() => {
      if (selectedUser) {
         const hasChanges =
            editUsername !== selectedUser.username ||
            editRole !== selectedUser.role ||
            editPassword !== "";
         setIsModified(hasChanges);
      }
   }, [editUsername, editRole, editPassword, selectedUser]);

   const getRoleBadgeColor = (role) => {
      switch (role.toLowerCase()) {
         case "admin":
            return theme.error;
         case "manager":
            return theme.card;
         default:
            return theme.success;
      }
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
         <Header
            title="👥 User Management"
            subtitle="Manage staff accounts and permissions"
            showBack
         />

         <Button
            title="Add New User"
            variant="success"
            icon="person-add"
            onPress={() => setModalVisible(true)}
            style={{ margin: 20 }}
         />

         <Loading isLoading={loading} message="Loading users...">
            <ScrollView style={{ paddingHorizontal: 20 }}>
               {users.length > 0 ? (
                  users.map((userItem) => (
                     <Card key={userItem._id} style={{ marginBottom: 12 }}>
                        <View
                           style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                           }}
                        >
                           <View style={{ flex: 1 }}>
                              <Subtitle>{userItem.username}</Subtitle>
                              <View
                                 style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                    alignSelf: "flex-start",
                                    backgroundColor: getRoleBadgeColor(
                                       userItem.role,
                                    ),
                                    marginTop: 4,
                                 }}
                              >
                                 <Caption
                                    style={{
                                       color: "#FFFFFF",
                                       fontWeight: "600",
                                       textTransform: "capitalize",
                                    }}
                                 >
                                    {userItem.role}
                                 </Caption>
                              </View>
                           </View>
                           <View style={{ flexDirection: "row", gap: 8 }}>
                              <TouchableOpacity
                                 style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    backgroundColor: theme.accent,
                                 }}
                                 onPress={() => openEditModal(userItem)}
                              >
                                 <MaterialIcons
                                    name="edit"
                                    size={20}
                                    color="#FFFFFF"
                                 />
                              </TouchableOpacity>
                              {userItem.username !== user?.username && (
                                 <TouchableOpacity
                                    style={{
                                       padding: 8,
                                       borderRadius: 6,
                                       backgroundColor: theme.error,
                                    }}
                                    onPress={() =>
                                       handleDeleteUser(userItem.username)
                                    }
                                 >
                                    <MaterialIcons
                                       name="delete"
                                       size={20}
                                       color="#FFFFFF"
                                    />
                                 </TouchableOpacity>
                              )}
                           </View>
                        </View>
                     </Card>
                  ))
               ) : (
                  <View
                     style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 60,
                     }}
                  >
                     <Body style={{ textAlign: "center" }}>
                        No users found.{"\n"}Create your first user to get
                        started.
                     </Body>
                  </View>
               )}
            </ScrollView>
         </Loading>

         {/* For the modals, replace the form fields: */}
         <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
         >
            <View
               style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
               }}
            >
               <View
                  style={{
                     backgroundColor: theme.background,
                     borderRadius: 12,
                     padding: 24,
                     width: "90%",
                     maxWidth: 400,
                  }}
               >
                  <Title style={{ marginBottom: 20 }}>Create New User</Title>

                  <FormField label="Username">
                     <Input
                        placeholder="Enter username"
                        value={newUsername}
                        onChangeText={setNewUsername}
                        autoCapitalize="none"
                     />
                  </FormField>

                  <FormField label="Password">
                     <PasswordInput
                        placeholder="Enter password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                     />
                  </FormField>

                  <FormField label="Role">
                     <Dropdown
                        options={["staff", "manager", "admin"]}
                        value={newRole}
                        onChange={setNewRole}
                     />
                  </FormField>

                  <View
                     style={{ flexDirection: "row", gap: 12, marginTop: 20 }}
                  >
                     <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={() => {
                           setModalVisible(false);
                           setNewUsername("");
                           setNewPassword("");
                           setNewRole("staff");
                        }}
                        style={{ flex: 1 }}
                     />
                     <Button
                        title="Create"
                        variant="success"
                        onPress={handleCreateUser}
                        style={{ flex: 1 }}
                     />
                  </View>
               </View>
            </View>
         </Modal>

         {/* Same pattern for Edit Modal */}
      </SafeAreaView>
   );
}
