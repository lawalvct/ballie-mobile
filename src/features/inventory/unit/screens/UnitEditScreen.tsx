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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { unitService } from "../services/unitService";
import type { Unit } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "UnitEdit">;

interface BaseUnit {
  id: number;
  name: string;
  symbol: string;
  display_name: string;
}

export default function UnitEditScreen({ navigation, route }: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [baseUnits, setBaseUnits] = useState<BaseUnit[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [isBaseUnit, setIsBaseUnit] = useState(true);
  const [baseUnitId, setBaseUnitId] = useState<number | undefined>(undefined);
  const [conversionFactor, setConversionFactor] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitResponse, formDataResponse] = await Promise.all([
        unitService.show(id),
        unitService.getFormData(),
      ]);

      const unit = unitResponse.unit;
      setName(unit.name || "");
      setSymbol(unit.symbol || "");
      setDescription(unit.description || "");
      setIsBaseUnit(unit.is_base_unit ?? true);
      setBaseUnitId(unit.base_unit_id ?? undefined);
      setConversionFactor(
        unit.conversion_factor ? String(unit.conversion_factor) : "",
      );
      setIsActive(unit.is_active ?? true);

      setBaseUnits(formDataResponse.base_units || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load unit", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter unit name", "error");
      return;
    }
    if (!symbol.trim()) {
      showToast("Please enter unit symbol", "error");
      return;
    }

    if (!isBaseUnit) {
      if (!baseUnitId) {
        showToast("Please select base unit", "error");
        return;
      }
      if (!conversionFactor.trim() || isNaN(Number(conversionFactor))) {
        showToast("Please enter valid conversion factor", "error");
        return;
      }
    }

    try {
      setSubmitting(true);
      const data: any = {
        name: name.trim(),
        symbol: symbol.trim(),
        description: description.trim() || undefined,
        is_base_unit: isBaseUnit,
        is_active: isActive,
      };

      if (!isBaseUnit) {
        data.base_unit_id = baseUnitId;
        data.conversion_factor = Number(conversionFactor);
      }

      await unitService.update(id, data);
      showToast("Unit updated successfully", "success");
      onUpdated?.(id);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update unit", "error");
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
          <Text style={styles.headerTitle}>Edit Unit</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading unit...</Text>
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
        <Text style={styles.headerTitle}>Edit Unit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Unit Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Kilogram"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Symbol */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Symbol <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={symbol}
              onChangeText={setSymbol}
              placeholder="e.g., kg"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Description */}
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
          <Text style={styles.sectionTitle}>Unit Type</Text>

          {/* Is Base Unit Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Base Unit</Text>
                <Text style={styles.helperText}>
                  {isBaseUnit
                    ? "This is a base unit (e.g., Kilogram, Meter)"
                    : "This is a derived unit (e.g., Gram, Centimeter)"}
                </Text>
              </View>
              <Switch
                value={isBaseUnit}
                onValueChange={setIsBaseUnit}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isBaseUnit ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>

          {/* Base Unit Picker (only for derived units) */}
          {!isBaseUnit && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Base Unit <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={baseUnitId}
                    onValueChange={(value) => setBaseUnitId(value)}
                    style={styles.picker}>
                    <Picker.Item
                      label="Select base unit..."
                      value={undefined}
                    />
                    {baseUnits.map((unit) => (
                      <Picker.Item
                        key={unit.id}
                        label={unit.display_name}
                        value={unit.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Conversion Factor */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Conversion Factor <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={conversionFactor}
                  onChangeText={setConversionFactor}
                  placeholder="e.g., 0.001"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.helperText}>
                  How many base units equal 1 of this unit
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Status</Text>

          {/* Is Active Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.helperText}>
                  {isActive
                    ? "This unit is active and can be used"
                    : "This unit is inactive"}
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

        {/* Submit Button */}
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
              <Text style={styles.submitButtonText}>Update Unit</Text>
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
