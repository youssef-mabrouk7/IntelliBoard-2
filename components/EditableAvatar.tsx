import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Image as ImageIcon, Pencil, RotateCcw } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { uploadToStorage } from '@/services/uploadService';

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

type Props = {
  value?: string | null;
  onUploaded: (url: string) => Promise<void> | void;
  size?: number;
  disabled?: boolean;
};

export function EditableAvatar({ value, onUploaded, size = 88, disabled }: Props) {
  const theme = Colors.light;
  const styles = React.useMemo(() => makeStyles(theme, size), [theme, size]);

  const [previewUri, setPreviewUri] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [state, setState] = React.useState<UploadState>('idle');
  const [error, setError] = React.useState<string>('');

  const pickImage = async (camera: boolean) => {
    if (camera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Camera permission is required.');
        return;
      }
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });
    if (result.canceled || result.assets.length === 0) return;
    setPreviewUri(result.assets[0].uri);
    setState('selected');
    setError('');
    setModalOpen(true);
  };

  const upload = async () => {
    if (!previewUri) return;
    try {
      setState('uploading');
      const uploaded = await uploadToStorage({
        bucket: 'avatars',
        folder: 'profile-photo',
        upsert: true,
        file: {
          uri: previewUri,
          name: 'avatar.jpg',
          mimeType: 'image/jpeg',
        },
      });
      await onUploaded(uploaded.url);
      setState('success');
      setTimeout(() => {
        setModalOpen(false);
        setPreviewUri(null);
        setState('idle');
      }, 450);
    } catch (e: any) {
      setState('error');
      setError(e?.message || 'Could not upload image.');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: value || 'https://via.placeholder.com/120' }} style={styles.avatar} />
        <TouchableOpacity style={styles.editBadge} disabled={disabled} onPress={() => pickImage(false)}>
          <Pencil size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} disabled={disabled} onPress={() => pickImage(false)}>
          <ImageIcon size={14} color={theme.text} />
          <Text style={styles.btnText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} disabled={disabled} onPress={() => pickImage(true)}>
          <Camera size={14} color={theme.text} />
          <Text style={styles.btnText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => (state === 'uploading' ? null : setModalOpen(false))}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.cardTitle}>Confirm profile photo</Text>
            <Image source={{ uri: previewUri || value || 'https://via.placeholder.com/120' }} style={styles.preview} />

            {state === 'uploading' && (
              <View style={styles.row}>
                <ActivityIndicator size="small" color={theme.tint} />
                <Text style={styles.info}>Uploading...</Text>
              </View>
            )}
            {state === 'success' && <Text style={[styles.info, { color: theme.status.completed }]}>Profile photo updated.</Text>}
            {state === 'error' && (
              <View style={styles.row}>
                <Text style={[styles.info, { color: theme.error, flex: 1 }]}>{error}</Text>
                <TouchableOpacity onPress={upload}>
                  <RotateCcw size={16} color={theme.tint} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} disabled={state === 'uploading'} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} disabled={state === 'uploading'} onPress={upload}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (theme: typeof Colors.light, size: number) =>
  StyleSheet.create({
    root: { alignItems: 'center', gap: 10 },
    avatarWrap: { position: 'relative' },
    avatar: { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.border },
    editBadge: {
      position: 'absolute',
      right: 2,
      bottom: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.tint,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.card,
    },
    actions: { flexDirection: 'row', gap: 8 },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    btnText: { color: theme.text, fontSize: 12, fontWeight: '600' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
    cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 },
    preview: { width: 180, height: 180, borderRadius: 90, alignSelf: 'center', marginBottom: 12, backgroundColor: theme.border },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    info: { fontSize: 13, color: theme.textSecondary, marginBottom: 8 },
    footer: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
    cancelBtn: { backgroundColor: theme.cardSecondary },
    saveBtn: { backgroundColor: theme.tint },
    cancelText: { color: theme.text, fontWeight: '700' },
    saveText: { color: '#fff', fontWeight: '700' },
  });

