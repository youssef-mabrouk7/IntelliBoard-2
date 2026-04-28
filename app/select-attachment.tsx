import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Image, FileText, Link, Camera, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { useAttachmentDraftStore } from '@/stores/attachmentDraftStore';
import type { DraftAttachment } from '@/stores/attachmentDraftStore';
import { useLocalization } from '@/utils/localization';

interface AttachmentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const attachmentTypes: AttachmentType[] = [
  {
    id: 'photo',
    name: 'Photo Library',
    icon: <Image size={24} color="#9C7BB8" />,
    color: '#9C7BB8',
  },
  {
    id: 'camera',
    name: 'Take Photo',
    icon: <Camera size={24} color="#4A7C9B" />,
    color: '#4A7C9B',
  },
  {
    id: 'document',
    name: 'Document',
    icon: <FileText size={24} color="#FFB74D" />,
    color: '#FFB74D',
  },
  {
    id: 'files',
    name: 'Image Files',
    icon: <Image size={24} color="#4CAF90" />,
    color: '#4CAF90',
  },
  {
    id: 'link',
    name: 'Add Link',
    icon: <Link size={24} color="#E57373" />,
    color: '#E57373',
  },
];

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

const EMPTY_ATTACHMENTS: DraftAttachment[] = [];

export default function SelectAttachmentScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const attachmentsState = useAttachmentDraftStore((s) => s.byContext.task);
  const attachments: DraftAttachment[] = attachmentsState ?? EMPTY_ATTACHMENTS;
  const setAttachments = useAttachmentDraftStore((s) => s.setAttachments);
  const removeAttachment = useAttachmentDraftStore((s) => s.removeAttachment);

  const attachedFiles: AttachedFile[] = attachments.map((item) => ({
    id: item.id,
    name: item.name,
    size: item.size ?? '',
    type: item.type,
  }));

  const handleRemoveFile = (id: string) => {
    removeAttachment('task', id);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const next = [
      ...attachments,
      {
        id: `${Date.now()}`,
        name: asset.fileName || `image-${Date.now()}.jpg`,
        uri: asset.uri,
        type: 'image' as const,
        size: asset.fileSize ? `${Math.max(1, Math.round(asset.fileSize / (1024 * 1024)))} MB` : undefined,
      },
    ];
    setAttachments('task', next);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const next = [
      ...attachments,
      {
        id: `${Date.now()}`,
        name: asset.fileName || `camera-${Date.now()}.jpg`,
        uri: asset.uri,
        type: 'image' as const,
      },
    ];
    setAttachments('task', next);
  };

  const addLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    const next = [
      ...attachments,
      {
        id: `${Date.now()}`,
        name: value.replace(/^https?:\/\//, ''),
        uri: value,
        type: 'link' as const,
      },
    ];
    setAttachments('task', next);
    setLinkInput('');
  };

  const handleChooseType = async (typeId: string) => {
    setSelectedType(typeId);
    if (typeId === 'photo' || typeId === 'files') await pickFromGallery();
    if (typeId === 'camera') await takePhoto();
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('attachments')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {attachedFiles.length > 0 && (
          <View style={styles.attachedSection}>
            <Text style={styles.sectionTitle}>{t('attachedFiles')} ({attachedFiles.length})</Text>
            <View style={styles.filesList}>
              {attachedFiles.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileCard}
                  onPress={() => {
                    const uri = attachments.find((a) => a.id === file.id)?.uri;
                    if (uri) {
                      void Linking.openURL(uri);
                    }
                  }}
                >
                  <View style={styles.fileIcon}>
                    <FileText size={24} color={theme.tint} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{file.size}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFile(file.id)}
                  >
                    <X size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>{t('addAttachment')}</Text>
          <View style={styles.linkRow}>
            <TextInput
              style={styles.linkInput}
              placeholder="https://..."
              placeholderTextColor={theme.textSecondary}
              value={linkInput}
              onChangeText={setLinkInput}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addLinkButton} onPress={addLink}>
              <Text style={styles.addLinkText}>Add Link</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.attachmentGrid}>
            {attachmentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.attachmentCard,
                  selectedType === type.id && styles.attachmentCardSelected,
                ]}
                onPress={() => handleChooseType(type.id)}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: type.color + '20' },
                  ]}
                >
                  {type.icon}
                </View>
                <Text style={styles.attachmentName}>{type.name}</Text>
                {selectedType === type.id && (
                  <View style={[styles.checkBadge, { backgroundColor: type.color }]}>
                    <Check size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.tintDark,
  },
  saveButton: {
    backgroundColor: theme.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  attachedSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSection: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  linkInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
  },
  addLinkButton: {
    backgroundColor: theme.tint,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addLinkText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  attachmentCard: {
    width: '30%',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    position: 'relative',
  },
  attachmentCardSelected: {
    borderColor: theme.tint,
    backgroundColor: theme.cardSecondary,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
