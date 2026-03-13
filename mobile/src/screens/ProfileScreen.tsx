import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Colors, Typography } from '../theme';

export const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Profile Section */}
        <View style={styles.profileHeader}>
          <Avatar size={80} />
          <Text style={styles.username}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        {/* Menu Options */}
        <View style={styles.card}>
          <MenuItem title="Edit Profile" onPress={() => {}} />
          <MenuItem title="Notifications" onPress={() => {}} />
          <MenuItem title="Privacy" onPress={() => {}} />
          <MenuItem title="Help" onPress={() => {}} isLast />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ title, onPress, isLast = false }: { title: string, onPress: () => void, isLast?: boolean }) => (
  <TouchableOpacity style={[styles.menuItem, !isLast && styles.borderBottom]} onPress={onPress}>
    <Text style={styles.menuTitle}>{title}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 32,
  },
  username: {
    ...Typography.title,
    fontSize: 24,
    marginTop: 16,
  },
  email: {
    ...Typography.caption,
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuTitle: {
    ...Typography.body,
  },
  arrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.danger,
  },
});
