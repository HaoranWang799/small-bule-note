import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { ChatListItem } from '../components/ChatListItem';
import { Colors, Typography } from '../theme';

// Mock Data
const MOCK_CHATS = [
  { id: '1', name: 'Alice', lastMessage: 'Hey, are we still on for tomorrow?', time: '10:42 AM', unreadCount: 2 },
  { id: '2', name: 'Bob', lastMessage: 'I sent you the files.', time: 'Yesterday', unreadCount: 0 },
  { id: '3', name: 'Charlie', lastMessage: 'See you then! 🎉', time: 'Tuesday', unreadCount: 0 },
];

export const ChatListScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ChatListItem
            name={item.name}
            lastMessage={item.lastMessage}
            time={item.time}
            unreadCount={item.unreadCount}
            onPress={() => console.log('Navigate to chat', item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
