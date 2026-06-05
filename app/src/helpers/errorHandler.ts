import { Alert } from "react-native";

export const handleError = (
  error: any,
  fallbackMessage = "An error occurred",
) => {
  console.error(error);
  const message =
    error?.response?.data?.message || error?.message || fallbackMessage;
  Alert.alert("Error", message);
};
