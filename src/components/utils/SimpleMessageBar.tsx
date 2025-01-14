import React, { useEffect } from "react";
import "../../styles/messageBar.css";

interface SimpleMessageBarProps {
  message: string;
  type: "warning" | "error" | "successful" | "confirm";
  duration?: number; // Opcional: Tiempo en milisegundos para mostrar el mensaje
  onDismiss: () => void;
}

const SimpleMessageBar: React.FC<SimpleMessageBarProps> = ({
  message,
  type,
  duration = 2000, // Tiempo por defecto: 2 segundos
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(); // Ocultar mensaje después de `duration`
    }, duration);

    return () => clearTimeout(timer); // Limpieza del temporizador
  }, [onDismiss, duration]);

  return (
    <div className={`message-bar ${type}`}>
      {message}
    </div>
  );
};

export default SimpleMessageBar;