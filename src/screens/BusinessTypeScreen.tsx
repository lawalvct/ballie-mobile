import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { authAPI } from "../api/endpoints/auth";
import { BusinessTypeCategory, BusinessType } from "../api/types";

interface BusinessTypeScreenProps {
  onNext: (businessTypeId: number) => void;
  onBack?: () => void;
}

export default function BusinessTypeScreen({
  onNext,
  onBack,
}: BusinessTypeScreenProps) {
  const [categories, setCategories] = useState<BusinessTypeCategory[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBusinessTypes();
  }, []);

  const loadBusinessTypes = async () => {
    try {
      const response = await authAPI.getBusinessTypes();
      setCategories(response.data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to load business types. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectType = (typeId: number) => {
    setSelectedTypeId(typeId);
  };

  const handleNext = () => {
    if (selectedTypeId) {
      onNext(selectedTypeId);
    } else {
      Alert.alert("Selection Required", "Please select a business type");
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Choose Your Business Type</Text>
        <Text style={styles.subtitle}>Step 1 of 3</Text>
        <Text style={styles.description}>
          Select the category that best describes your business
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading business types...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {categories.map((category) => (
            <View key={category.category} style={styles.categoryContainer}>
              {/* Category Header */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.category)}>
                <Text style={styles.categoryIcon}>📂</Text>
                <Text style={styles.categoryName}>{category.category}</Text>
                <Text style={styles.expandIcon}>
                  {expandedCategory === category.category ? "▼" : "▶"}
                </Text>
              </TouchableOpacity>

              {/* Business Types */}
              {expandedCategory === category.category && (
                <View style={styles.typesContainer}>
                  {category.types.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        selectedTypeId === type.id && styles.typeCardSelected,
                      ]}
                      onPress={() => handleSelectType(type.id)}>
                      <Text style={styles.typeIcon}>{type.icon}</Text>
                      <View style={styles.typeInfo}>
                        <Text
                          style={[
                            styles.typeName,
                            selectedTypeId === type.id &&
                              styles.typeNameSelected,
                          ]}>
                          {type.name}
                        </Text>
                        <Text style={styles.typeDescription}>
                          {type.description}
                        </Text>
                      </View>
                      {selectedTypeId === type.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Next Button */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedTypeId && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedTypeId}>
            <LinearGradient
              colors={["#d1b05e", "#c9a556"]}
              style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: BRAND_COLORS.gold,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  expandIcon: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  typesContainer: {
    marginTop: 8,
    gap: 8,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  typeCardSelected: {
    backgroundColor: "rgba(209, 176, 94, 0.15)",
    borderColor: BRAND_COLORS.gold,
    borderWidth: 2,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: BRAND_COLORS.gold,
  },
  typeDescription: {
    fontSize: 14,
    color: BRAND_COLORS.lavender,
  },
  checkmark: {
    fontSize: 24,
    color: BRAND_COLORS.gold,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
