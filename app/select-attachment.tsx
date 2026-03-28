import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Image, FileText, Link, Camera, Folder, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';

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
    name: 'Browse Files',
    icon: <Folder size={24} color="#4CAF90" />,
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

export default function SelectAttachmentScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([
    { id: '1', name: 'Design_Mockup_v2.png', size: '2.4 MB', type: 'image' },
    { id: '2', name: 'Requirements.pdf', size: '1.1 MB', type: 'document' },
  ]);

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== id));
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attachments</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {attachedFiles.length > 0 && (
          <View style={styles.attachedSection}>
            <Text style={styles.sectionTitle}>Attached Files ({attachedFiles.length})</Text>
            <View style={styles.filesList}>
              {attachedFiles.map((file) => (
                <View key={file.id} style={styles.fileCard}>
                  <View style={styles.fileIcon}>
                    <FileText size={24} color={Colors.light.tint} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{file.size}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFile(file.id)}
                  >
                    <X size={18} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Attachment</Text>
          <View style={styles.attachmentGrid}>
            {attachmentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.attachmentCard,
                  selectedType === type.id && styles.attachmentCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.tintDark,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
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
    color: Colors.light.text,
    marginBottom: 16,
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint + '20',
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.cardSecondary,
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
  attachmentCard: {
    width: '30%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  attachmentCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.cardSecondary,
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
    color: Colors.light.text,
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
