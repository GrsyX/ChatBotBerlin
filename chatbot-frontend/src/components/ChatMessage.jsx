import React from 'react';
import PropTypes from 'prop-types';
import './ChatMessage.css';
import botAvatar from '../assets/bear.png';
import { renderWithLinks, generateChatTitle, renderFormattedContent } from '../utils/chatHelpers.jsx';

/**
 * Komponente: ChatMessage
 *
 * Stellt eine einzelne Nachricht im Chat dar.
 * Je nach Absender (user | bot) wird sie rechts oder links dargestellt.
 * Wenn die Nachricht vom Bot stammt, wird zusätzlich ein Avatar angezeigt.
 *
 * @component
 * @param {Object} props - Die Properties der Komponente
 * @param {Object} props.message - Das Nachrichtenobjekt
 * @param {'user'|'bot'} props.message.role - Rolle des Absenders ('user' oder 'bot')
 * @param {string} props.message.content - Textinhalt der Nachricht
 * @returns {JSX.Element} JSX für die Darstellung einer Chatnachricht
 */
const ChatMessage = ({ message, onButtonClick }) => {
  const { role, content, buttons } = message;

  // NICHTS rendern, wenn weder Text noch Buttons vorhanden sind
  if (!content && (!buttons || buttons.length === 0)) {
    return null;
  }

  return (
    <div className={`chat-message ${role}`}>
      {role === 'bot' && (
        <img
          src={botAvatar}
          alt="Bot Avatar"
          className="chatbot-avatar"
        />
      )}
      {/* Text anzeigen, jetzt mit Formatierung */}
      {content && <div className="chat-text">{renderFormattedContent(content)}</div>}
      {/* Buttons anzeigen, falls vorhanden */}
      {buttons && buttons.length > 0 && (
        <div className="bot-buttons">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className="service-btn"
              onClick={() => onButtonClick ? onButtonClick(btn) : null}
            >
              {btn.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// PropTypes: Statische Typprüfung der Props
ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.oneOf(['user', 'bot']).isRequired,
    content: PropTypes.string,
    buttons: PropTypes.array,
  }).isRequired,
  onButtonClick: PropTypes.func,
};

export default ChatMessage;
