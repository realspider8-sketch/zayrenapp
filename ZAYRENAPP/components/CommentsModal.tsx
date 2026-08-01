import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_URL } from '@/lib/api';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    name: string;
    username: string;
    profile_pic?: string;
  };
}

export function CommentsModal({
  visible,
  postId,
  onClose,
  onCommentAdded
}: {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
  onCommentAdded: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      if (!res.ok) throw new Error('Failed to add comment');
      const addedComment = await res.json();
      setComments((prev) => [...prev, addedComment]);
      setNewComment('');
      onCommentAdded();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${API_URL}/api/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments((prev) => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwner = currentUserId === item.user_id;
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.commentContent}>
          <Text style={styles.commentUser}>
            {item.user?.name || 'Unknown'} <Text style={styles.commentUsername}>@{item.user?.username || 'user'}</Text>
          </Text>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteBtn}>
            <Feather name="trash-2" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{comments.length} Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color="#A78BFA" />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#6B7280"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !newComment.trim() && { opacity: 0.5 }]} 
              onPress={handleAddComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? (
                 <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#0D0B1A',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    position: 'relative'
  },
  headerTitle: {
    color: '#F5F3FF',
    fontSize: 16,
    fontWeight: '700'
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center'
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center'
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  commentContent: {
    flex: 1
  },
  commentUser: {
    color: '#E5E7EB',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4
  },
  commentUsername: {
    color: '#6B7280',
    fontWeight: '400',
    fontSize: 12
  },
  commentText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20
  },
  deleteBtn: {
    padding: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#130E26'
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#fff',
    marginRight: 12
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
