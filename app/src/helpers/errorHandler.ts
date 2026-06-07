import { Alert } from "react-native";

export const handleError = (
  error: any,
  fallbackMessage = "An error occurred",
) => {
  const safeError = error instanceof Error ? error.message.replace(/[\r\n]/g, " ") : String(error).replace(/[\r\n]/g, " ");
  console.error(safeError);
  const message =
    error?.response?.data?.message || error?.message || fallbackMessage;
  Alert.alert("Error", message);
};
