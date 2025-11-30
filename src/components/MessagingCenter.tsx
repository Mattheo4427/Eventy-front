import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Conversation, Message, User } from '../types';
import { InteractionService } from '../services/InteractionService';
import { UserService } from '../services/UserService';
import { ReportForm } from './ReportSystem';
import { ReportService } from '../services/ReportService';
import { Alert } from 'react-native';

interface MessagingCenterProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User;
  initialConversationId?: string | null;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  visible,
  onClose,
  currentUser,
  initialConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Record<string, User>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const screenHeight = Dimensions.get('window').height;
  const chatHeight = screenHeight * 0.6; // 60% of screen height for chat

  // Load conversations when visible
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible) {
      loadConversations();
      // Poll for conversation list updates
      interval = setInterval(() => loadConversations(false), 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  // Load participants details
  useEffect(() => {
    const loadParticipants = async () => {
      const missingIds = new Set<string>();
      
      conversations.forEach(c => {
        const otherId = getOtherParticipantId(c);
        if (!participants[otherId]) {
          missingIds.add(otherId);
        }
      });

      if (missingIds.size === 0) return;

      const newParticipants = { ...participants };
      let hasUpdates = false;

      for (const id of missingIds) {
        try {
          const user = await UserService.getUserById(id);
          newParticipants[id] = user;
          hasUpdates = true;
        } catch (e) {
          console.error(`Failed to load user ${id}`, e);
        }
      }

      if (hasUpdates) {
        setParticipants(newParticipants);
      }
    };

    if (conversations.length > 0) {
      loadParticipants();
    }
  }, [conversations]);

  // Handle initial conversation
  useEffect(() => {
    if (visible && initialConversationId) {
      setSelectedConversation(initialConversationId);
    } else if (!visible) {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [visible, initialConversationId]);

  // Load messages when conversation selected
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (selectedConversation) {
      // Initial load: fetch messages (marking as read) THEN refresh list
      const init = async () => {
        await loadMessages(selectedConversation);
        loadConversations(false);
      };
      init();

      // Set up polling for new messages
      interval = setInterval(() => {
        loadMessages(selectedConversation);
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await InteractionService.getMyConversations();
      setConversations(data);
    } catch (e) {
      console.error("Error loading conversations:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const data = await InteractionService.getConversationMessages(id);
      setMessages(data);
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        await InteractionService.sendMessage(selectedConversation, newMessage.trim());
        setNewMessage('');
        await loadMessages(selectedConversation);
        loadConversations(); // Refresh list for last message update
      } catch (e) {
        console.error("Error sending message:", e);
      }
    }
  };

  const handleReportSubmit = async (reportData: any) => {
    try {
      await ReportService.createReport({
        reportedUserId: reportData.reportedId,
        reportType: reportData.reportType,
        reason: reportData.reason,
        description: reportData.description,
        evidence: reportData.evidence
      });
      
      setShowReportModal(false);
    } catch (error) {
      console.error("Report error:", error);
      throw error; // Let ReportModal handle the error alert
    }
  };

  const getOtherParticipantId = (conversation: Conversation) => {
    if (conversation.participant1Id === currentUser.id) return conversation.participant2Id;
    return conversation.participant1Id;
  };

  const formatMessageTime = (dateString: any) => {
    if (!dateString) return '';
    let date;
    // Handle array format from Java LocalDateTime [yyyy, MM, dd, HH, mm, ss]
    if (Array.isArray(dateString)) {
       date = new Date(dateString[0], dateString[1]-1, dateString[2], dateString[3], dateString[4], dateString[5] || 0);
    } else {
       date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getParticipantName = (id: string) => {
    const user = participants[id];
    if (user) return `${user.firstName} ${user.lastName}`;
    return `User ${id.substring(0, 8)}...`;
  };

  const getInitials = (id: string) => {
    const user = participants[id];
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return '?';
  };

  const Avatar = ({ id, size = 40 }: { id: string, size?: number }) => (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{getInitials(id)}</Text>
    </View>
  );

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

  if (!selectedConversation) {
    return (
      <CustomModal 
        visible={visible} 
        onClose={onClose} 
        title="Messages"
        contentStyle={{ height: chatHeight }} // Use fixed height for list view too
      >
        <View style={styles.container}>
          {loading && conversations.length === 0 ? (
             <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
          ) : conversations.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ScrollView style={styles.conversationsList}>
                {conversations.map((conversation) => {
                  const otherId = getOtherParticipantId(conversation);
                  const lastMessage = conversation.lastMessage;
                  const unreadCount = conversation.unreadCount || 0;
                  const isUnread = unreadCount > 0;

                  return (
                    <TouchableOpacity
                      key={conversation.id}
                      style={[
                        styles.conversationItem,
                        isUnread && styles.unreadConversation
                      ]}
                      onPress={() => setSelectedConversation(conversation.id)}
                  >
                    <View style={styles.conversationRow}>
                      <Avatar id={otherId} />
                      <View style={styles.conversationContent}>
                        <View style={styles.conversationHeader}>
                          <Text style={styles.participantName}>
                            {getParticipantName(otherId)}
                          </Text>
                          <Text style={styles.conversationDate}>
                            {lastMessage && formatMessageTime(lastMessage.dateSent)}
                          </Text>
                        </View>
                        {lastMessage && (
                          <Text
                            style={[
                              styles.lastMessage,
                              isUnread && styles.unreadText
                            ]}
                            numberOfLines={1}
                          >
                            {lastMessage.senderId === currentUser.id ? 'Vous: ' : ''}
                            {lastMessage.content}
                          </Text>
                        )}
                      </View>
                      {isUnread && (
                        <View style={styles.unreadIndicator}>
                          {unreadCount > 1 && (
                            <Text style={styles.unreadCountText}>{unreadCount}</Text>
                          )}
                        </View>
                      )}
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

  const conversation = conversations.find(c => c.id === selectedConversation);
  const otherId = conversation ? getOtherParticipantId(conversation) : '...';

  return (
    <CustomModal 
      visible={visible} 
      onClose={onClose} 
      title={showReportModal ? `Signaler l'utilisateur` : `Conversation`}
      contentStyle={{ padding: 0, height: chatHeight }} // Use calculated height
    >
      {showReportModal ? (
        <ReportForm
          reportType="user"
          reportedId={otherId}
          reportedName={getParticipantName(otherId)}
          currentUserId={currentUser.id}
          onSubmitReport={handleReportSubmit}
          onCancel={() => setShowReportModal(false)}
          fullHeight={true}
        />
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setSelectedConversation(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Avatar id={otherId} size={32} />
            <Text style={styles.chatTitle}>{getParticipantName(otherId)}</Text>
            <TouchableOpacity 
              onPress={() => setShowReportModal(true)}
              style={styles.reportButton}
            >
              <Text style={styles.reportButtonText}>⚠️</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.messagesContainer}
            contentContainerStyle={{ padding: 16 }} // Add padding inside scrollview instead
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const isOwn = message.senderId === currentUser.id;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper
                  ]}
                >
                  {!isOwn && <Avatar id={message.senderId} size={28} />}
                  <View
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
                      {formatMessageTime(message.dateSent)}
                    </Text>
                  </View>
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
        </KeyboardAvoidingView>
      )}
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  conversationItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  unreadConversation: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bfdbfe',
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    lineHeight: 24,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  reportButton: {
    padding: 8,
  },
  reportButtonText: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-end',
  },
  ownMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageItem: {
    maxWidth: '75%',
    borderRadius: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  ownMessage: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  avatar: {
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  avatarText: {
    color: '#4338ca',
    fontWeight: '600',
  },
});