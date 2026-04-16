import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FileText, Paperclip, Trash2, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { type LocalUploadFile, type UploadValidationRules, validateUploadFile } from '@/services/uploadService';

export type AttachmentItem = LocalUploadFile & {
  id: string;
  kind: 'image' | 'file';
};

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

type Props = {
  value: AttachmentItem[];
  onChange: (next: AttachmentItem[]) => void;
  validationRules: UploadValidationRules;
  uploadState: UploadState;
  errorMessage?: string;
  onRetry?: () => void;
  disabled?: boolean;
};

function makeId() {
  const maybeCrypto = globalThis.crypto as { randomUUID?: () => string };
  if (maybeCrypto?.randomUUID) return maybeCrypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AttachmentComposer({
  value,
  onChange,
  validationRules,
  uploadState,
  errorMessage,
  onRetry,
  disabled,
}: Props) {
  const theme = Colors.light;
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const addAttachment = (incoming: Omit<AttachmentItem, 'id'>) => {
    const v = validateUploadFile(incoming, validationRules);
    if (!v.ok) {
      Alert.alert('Attachment validation', v.error);
      return;
    }
    onChange([{ ...incoming, id: makeId() }, ...value]);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });
    if (result.canceled) return;
    const a = result.assets[0];
    addAttachment({
      uri: a.uri,
      name: a.name ?? 'file',
      mimeType: a.mimeType ?? null,
      size: a.size ?? null,
      kind: (a.mimeType ?? '').startsWith('image/') ? 'image' : 'file',
    });
  };

  const pickImage = async (camera: boolean) => {
    if (camera) {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (!cam.granted) {
        Alert.alert('Permission required', 'Camera permission is needed to capture an image.');
        return;
      }
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });

    if (result.canceled || result.assets.length === 0) return;
    const a = result.assets[0];
    addAttachment({
      uri: a.uri,
      name: a.fileName ?? (camera ? 'camera.jpg' : 'image.jpg'),
      mimeType: a.mimeType ?? 'image/jpeg',
      size: a.fileSize ?? null,
      kind: 'image',
    });
  };

  const removeItem = (id: string) => onChange(value.filter((x) => x.id !== id));

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={pickDocument} disabled={disabled || uploadState === 'uploading'}>
          <Paperclip size={16} color={theme.text} />
          <Text style={styles.toolBtnText}>Attach</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(false)} disabled={disabled || uploadState === 'uploading'}>
          <Text style={styles.toolBtnText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => pickImage(true)} disabled={disabled || uploadState === 'uploading'}>
          <Text style={styles.toolBtnText}>Camera</Text>
        </TouchableOpacity>
        {!!value.length && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => onChange([])} disabled={uploadState === 'uploading'}>
            <Trash2 size={14} color={theme.error} />
            <Text style={[styles.clearText, { color: theme.error }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {value.map((a) => (
        <View key={a.id} style={styles.item}>
          {a.kind === 'image' ? (
            <Image source={{ uri: a.uri }} style={styles.thumb} />
          ) : (
            <View style={styles.fileIcon}><FileText size={18} color={theme.textSecondary} /></View>
          )}
          <Text numberOfLines={1} style={styles.fileName}>{a.name}</Text>
          <Pressable onPress={() => removeItem(a.id)} disabled={uploadState === 'uploading'}>
            <X size={16} color={theme.textSecondary} />
          </Pressable>
        </View>
      ))}

      {uploadState === 'uploading' && (
        <View style={styles.stateRow}>
          <ActivityIndicator size="small" color={theme.tint} />
          <Text style={styles.stateText}>Uploading attachment(s)...</Text>
        </View>
      )}
      {uploadState === 'success' && <Text style={[styles.stateText, { color: theme.status.completed }]}>Upload successful.</Text>}
      {uploadState === 'error' && (
        <View style={styles.stateRow}>
          <Text style={[styles.stateText, { color: theme.error }]}>{errorMessage || 'Upload failed.'}</Text>
          {onRetry && (
            <TouchableOpacity onPress={onRetry}>
              <Text style={[styles.stateText, { color: theme.tint, fontWeight: '700' }]}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: { marginTop: 12, gap: 8 },
    toolbar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    toolBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    toolBtnText: { color: theme.text, fontSize: 13, fontWeight: '600' },
    clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' },
    clearText: { fontSize: 12, fontWeight: '600' },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 10,
    },
    thumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.border },
    fileIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.cardSecondary, alignItems: 'center', justifyContent: 'center' },
    fileName: { flex: 1, fontSize: 13, color: theme.text, fontWeight: '600' },
    stateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    stateText: { fontSize: 12, color: theme.textSecondary },
  });

