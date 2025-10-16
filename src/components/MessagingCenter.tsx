import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Conversation, Message, User } from '../types';

interface MessagingCenterProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  messages: Message[];
  currentUser: User;
  users: User[];
  onSendMessage: (conversationId: string, content: string) => void;
  onCreateConversation: (participantId: string, ticketId?: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  visible,
  onClose,
  conversations,
  messages,
  currentUser,
  users,
  onSendMessage,
  onCreateConversation,
  onMarkAsRead
}) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUser.id);
    return users.find(u => u.id === otherUserId);
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      onSendMessage(selectedConversation, newMessage.trim());
      setNewMessage('');
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Aucun message</Text>
      <Text style={styles.emptyMessage}>
        Vous n'avez aucune conversation pour le moment.{"\n"}
        Commencez à échanger avec d'autres utilisateurs !
      </Text>
    </View>
  );

  const unreadConversations = conversations.filter(conv => {
    const convMessages = getConversationMessages(conv.id);
    return convMessages.some(msg => !msg.read && msg.senderId !== currentUser.id);
  });

  if (!selectedConversation) {
    return (
      <CustomModal visible={visible} onClose={onClose} title="Messages">
        <View style={styles.container}>
          {conversations.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>
                  Conversations {unreadConversations.length > 0 && `(${unreadConversations.length})`}
                </Text>
              </View>

              <ScrollView style={styles.conversationsList}>
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const lastMessage = conversation.lastMessage;
                  const hasUnread = getConversationMessages(conversation.id)
                    .some(msg => !msg.read && msg.senderId !== currentUser.id);

                  return (
                    <TouchableOpacity
                      key={conversation.id}
                      style={[
                        styles.conversationItem,
                        hasUnread && styles.unreadConversation
                      ]}
                      onPress={() => setSelectedConversation(conversation.id)}
                  >
                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.participantName}>
                          {otherParticipant?.name || 'Utilisateur inconnu'}
                        </Text>
                        <Text style={styles.conversationDate}>
                          {lastMessage && formatMessageTime(lastMessage.date)}
                        </Text>
                      </View>
                      {lastMessage && (
                        <Text
                          style={[
                            styles.lastMessage,
                            hasUnread && styles.unreadText
                          ]}
                          numberOfLines={2}
                        >
                          {lastMessage.senderId === currentUser.id ? 'Vous: ' : ''}
                          {lastMessage.content}
                        </Text>
                      )}
                      {hasUnread && <View style={styles.unreadIndicator} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              </ScrollView>
            </>
          )}
        </View>
      </CustomModal>
    );
  }

  const conversationMessages = getConversationMessages(selectedConversation);
  const conversation = conversations.find(c => c.id === selectedConversation);
  const otherParticipant = conversation ? getOtherParticipant(conversation) : null;

  return (
    <CustomModal visible={visible} onClose={onClose} title={`Conversation avec ${otherParticipant?.name || 'Utilisateur'}`}>
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => setSelectedConversation(null)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{otherParticipant?.name}</Text>
        </View>

        <ScrollView style={styles.messagesContainer}>
          {conversationMessages.map((message) => {
            const isOwn = message.senderId === currentUser.id;
            return (
              <View
                key={message.id}
                style={[
                  styles.messageItem,
                  isOwn ? styles.ownMessage : styles.otherMessage
                ]}
              >
                <Text style={[
                  styles.messageContent,
                  isOwn ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  isOwn ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                  {formatMessageTime(message.date)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.messageInput}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Tapez votre message..."
            multiline
            maxLength={500}
          />
          <Button
            title="Envoyer"
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          />
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  conversationsList: {
    flex: 1,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  unreadConversation: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  conversationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadText: {
    color: '#111827',
    fontWeight: '500',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 16,
    maxHeight: 400,
  },
  messageItem: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  otherMessageText: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  ownMessageTime: {
    color: '#9ca3af',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6b7280',
    textAlign: 'left',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    maxHeight: 100,
    fontSize: 14,
  },
});