import React from "react";
import "../../styles/messageBar.css";

interface ConfirmMessageBarProps {
  message: string;
  onAccept: () => void;
  onReject: () => void;
}

const ConfirmMessageBar: React.FC<ConfirmMessageBarProps> = ({
  message,
  onAccept,
  onReject,
}) => {
  return (
    <div className="message-bar confirm">
      <p>{message}</p>
      <div className="button-group">
        <button className="accept-button" onClick={onAccept}>
          Accept
        </button>
        <button className="reject-button" onClick={onReject}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmMessageBar;