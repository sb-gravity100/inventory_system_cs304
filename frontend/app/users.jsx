import {
  View,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Loading } from "../components/ui";
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
import Dropdown from "../components/ui/Dropdown";
import FormField from "../components/ui/FormField";
import FAB from "../components/ui/FAB";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const ROLE_COLOR = (theme) => ({
  admin: theme.danger,
  manager: theme.warning,
  staff: theme.statusCompleted,
});

export default function UsersScreen() {
  const { theme } = useTheme();
  const { authState, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Create form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("staff");

  // Edit form
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await axios.post(
        `${api_url}/auth/admin-create-user`,
        { username: newUsername, password: newPassword, role: newRole },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      setModalVisible(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("staff");
      fetchUsers();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    if (!editUsername) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    try {
      await axios.post(
        `${api_url}/auth/admin-update-user`,
        { username: selectedUser.username, newUsername: editUsername, newRole: editRole },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      if (editPassword) {
        await axios.post(
          `${api_url}/auth/admin-change-password`,
          { username: editUsername, newPassword: editPassword },
          { headers: { Authorization: `Bearer ${authState.token}` } },
        );
      }
      setEditModalVisible(false);
      setSelectedUser(null);
      setEditUsername("");
      setEditRole("");
      setEditPassword("");
      fetchUsers();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = (username) => {
    Alert.alert(
      "Delete User",
      `Delete "${username}"? This cannot be undone.`,
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
                { headers: { Authorization: `Bearer ${authState.token}` } },
              );
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", error.response?.data?.message || "Failed to delete user");
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
    setIsModified(false);
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

  const roleColors = ROLE_COLOR(theme);

  const s = StyleSheet.create({
    scrollContent: {
      padding: Spacing.screenPadding,
      paddingBottom: 100,
    },
    sectionLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.sectionLabel,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: Spacing.sm,
    },
    list: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    rowName: {
      fontFamily: Font.medium,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    roleBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.button,
      marginTop: 3,
    },
    roleBadgeText: {
      fontFamily: Font.medium,
      fontSize: FontSize.listSecondary,
      color: "#ffffff",
      textTransform: "capitalize",
    },
    rowActions: {
      flexDirection: "row",
    },
    iconBtn: {
      padding: Spacing.sm,
    },
    emptyText: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.modal,
      padding: Spacing.xl,
      width: "90%",
      maxWidth: 400,
    },
    modalTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      marginBottom: Spacing.xl,
    },
    modalActions: {
      flexDirection: "row",
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="User Management" subtitle="Manage staff accounts" showBack />

      <Loading isLoading={loading} message="Loading users...">
        <ScrollView
          contentContainerStyle={s.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        >
          <Text style={s.sectionLabel}>ACCOUNTS ({users.length})</Text>
          {users.length === 0 ? (
            <Text style={s.emptyText}>No users found.</Text>
          ) : (
            <View style={s.list}>
              {users.map((userItem, i) => (
                <View key={userItem._id}>
                  {i > 0 && <View style={s.divider} />}
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowName}>{userItem.username}</Text>
                      <View
                        style={[
                          s.roleBadge,
                          { backgroundColor: roleColors[userItem.role] || theme.textSecondary },
                        ]}
                      >
                        <Text style={s.roleBadgeText}>{userItem.role}</Text>
                      </View>
                    </View>
                    <View style={s.rowActions}>
                      <TouchableOpacity style={s.iconBtn} onPress={() => openEditModal(userItem)}>
                        <MaterialIcons name="edit" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                      {userItem.username !== user?.username && (
                        <TouchableOpacity
                          style={s.iconBtn}
                          onPress={() => handleDeleteUser(userItem.username)}
                        >
                          <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Loading>

      <FAB actions={[{ label: "Add User", icon: "person-add", onPress: () => setModalVisible(true) }]} />

      {/* Create Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Create User</Text>
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
              <Dropdown options={["staff", "manager", "admin"]} value={newRole} onChange={setNewRole} />
            </FormField>
            <View style={s.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setModalVisible(false);
                  setNewUsername("");
                  setNewPassword("");
                  setNewRole("staff");
                }}
                style={{ flex: 1 }}
              />
              <Button title="Create" variant="primary" onPress={handleCreateUser} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Edit User</Text>
            <FormField label="Username">
              <Input
                placeholder="Enter username"
                value={editUsername}
                onChangeText={setEditUsername}
                autoCapitalize="none"
              />
            </FormField>
            <FormField label="New Password">
              <PasswordInput
                placeholder="Leave blank to keep current"
                value={editPassword}
                onChangeText={setEditPassword}
              />
            </FormField>
            <FormField label="Role">
              <Dropdown options={["staff", "manager", "admin"]} value={editRole} onChange={setEditRole} />
            </FormField>
            <View style={s.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedUser(null);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Save"
                variant="primary"
                onPress={handleUpdateUser}
                disabled={!isModified}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
