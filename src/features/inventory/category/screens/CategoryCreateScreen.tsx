import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { categoryService } from "../services/categoryService";
import type { CategoryParentOption } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "CategoryCreate">;

export default function CategoryCreateScreen({ navigation, route }: Props) {
  const { onCreated } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parentOptions, setParentOptions] = useState<CategoryParentOption[]>(
    [],
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getFormData();
      setParentOptions(response.parent_categories || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load form data", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderParentLabel = (option: CategoryParentOption) => {
    const level = option.level || 0;
    const prefix = level > 0 ? "—".repeat(level) + " " : "";
    return `${prefix}${option.name}`;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter category name", "error");
      return;
    }

    try {
      setSubmitting(true);
      const data: any = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        parent_id: parentId ?? undefined,
        sort_order: sortOrder ? Number(sortOrder) : undefined,
        is_active: isActive,
        meta_title: metaTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
      };

      await categoryService.create(data);
      showToast("Category created successfully", "success");
      onCreated?.();
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to create category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Category</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Category</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Category Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Beverages"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Slug</Text>
            <TextInput
              style={styles.input}
              value={slug}
              onChangeText={setSlug}
              placeholder="e.g., beverages"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Hierarchy</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Parent Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={parentId}
                onValueChange={(value) => setParentId(value)}
                style={styles.picker}>
                <Picker.Item label="No Parent (Root)" value={undefined} />
                {parentOptions.map((option) => (
                  <Picker.Item
                    key={option.id}
                    label={renderParentLabel(option)}
                    value={option.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sort Order</Text>
            <TextInput
              style={styles.input}
              value={sortOrder}
              onChangeText={setSortOrder}
              placeholder="e.g., 1"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>SEO</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Meta Title</Text>
            <TextInput
              style={styles.input}
              value={metaTitle}
              onChangeText={setMetaTitle}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Meta Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={metaDescription}
              onChangeText={setMetaDescription}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Status</Text>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.helperText}>
                  {isActive
                    ? "This category will be available for use"
                    : "This category will be inactive"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isActive ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}>
            {submitting ? (
              <ActivityIndicator size="small" color={BRAND_COLORS.darkPurple} />
            ) : (
              <Text style={styles.submitButtonText}>Create Category</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  formSection: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  picker: {
    height: 48,
    color: BRAND_COLORS.darkPurple,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
  },
});
