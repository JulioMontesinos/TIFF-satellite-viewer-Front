import React, { useEffect } from "react";
import "../../styles/messageBar.css";

interface SimpleMessageBarProps {
  message: string;
  type: "warning" | "error" | "successful" | "confirm";
  duration?: number; // Optional: Time in milliseconds to display the message
  onDismiss: () => void;
}

const SimpleMessageBar: React.FC<SimpleMessageBarProps> = ({
  message,
  type,
  duration = 2000, // Default time: 2 seconds
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(); // Hide message after `duration`
    }, duration);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [onDismiss, duration]);

  return (
    <div className={`message-bar ${type}`}>
      {message}
    </div>
  );
};

export default SimpleMessageBar;