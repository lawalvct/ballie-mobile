/* ─── useVoiceInput ─────────────────────────────────────────────────────────
 *  Custom hook that encapsulates expo-speech-recognition logic for
 *  AIInvoiceScreen.  Keeps the screen file slim.
 *
 *  Usage:
 *    const { isListening, voicePartial, pulseAnim, handleVoiceToggle } =
 *      useVoiceInput(setDescription);
 * ─────────────────────────────────────────────────────────────────────────── */

import { useState, useCallback, useRef, useEffect } from "react";
import { Animated, Alert } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { showToast } from "../../../../utils/toast";
import { NIGERIAN_CONTEXTUAL_STRINGS } from "../screens/aiInvoiceConstants";

export function useVoiceInput(
  setDescription: React.Dispatch<React.SetStateAction<string>>,
) {
  const [isListening, setIsListening] = useState(false);
  const [voicePartial, setVoicePartial] = useState("");

  /* ── Pulse animation while recording ── */
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  /* ── Speech recognition events ── */
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setVoicePartial("");
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript ?? "";
    if (event.isFinal) {
      setDescription((prev) => {
        const separator = prev.trim() ? " " : "";
        return prev.trim() + separator + transcript;
      });
      setVoicePartial("");
    } else {
      setVoicePartial(transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setVoicePartial("");
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.warn("[Voice] Error:", event.error, event.message);
    setIsListening(false);
    setVoicePartial("");
    if (event.error === "not-allowed") {
      Alert.alert(
        "Microphone Permission",
        "Please allow microphone access in your device settings to use voice input.",
      );
    } else if (event.error !== "no-speech" && event.error !== "aborted") {
      showToast("Voice input failed. Please try again.", "error");
    }
  });

  /* ── Toggle handler ── */
  const handleVoiceToggle = useCallback(async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "Microphone and speech recognition permissions are needed for voice input.",
      );
      return;
    }

    // Nigerian English — biased toward local business vocabulary
    ExpoSpeechRecognitionModule.start({
      lang: "en-NG",
      interimResults: true,
      addsPunctuation: true,
      continuous: false,
      contextualStrings: NIGERIAN_CONTEXTUAL_STRINGS,
    });
  }, [isListening]);

  return { isListening, voicePartial, pulseAnim, handleVoiceToggle };
}
