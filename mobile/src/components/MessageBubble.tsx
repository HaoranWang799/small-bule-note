import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface MessageBubbleProps {
  isSent: boolean;
  text: string;
  timestamp: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ isSent, text, timestamp }) => {
  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={styles.messageText}>{text}</Text>
      </View>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sentBubble: {
    backgroundColor: Colors.bubbleSent,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: Colors.bubbleReceived,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
