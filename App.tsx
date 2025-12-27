import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import Splash1 from "./src/screens/Splash1";
import Splash2 from "./src/screens/Splash2";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";

type Screen = "splash1" | "splash2" | "login" | "forgotPassword";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash1");

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash1":
        return <Splash1 onNext={() => setCurrentScreen("splash2")} />;
      case "splash2":
        return <Splash2 onNext={() => setCurrentScreen("login")} />;
      case "login":
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen onBack={() => setCurrentScreen("login")} />
        );
      default:
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
          />
        );
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}
