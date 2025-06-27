import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';
import './ChatWindow.css';

/**
 * ChatWindow-Komponente
 *
 * Hauptkomponente für die Darstellung des Chatverlaufs.
 * Verarbeitet ein Array von Nachrichtenobjekten und rendert diese
 * sequentiell als ChatMessage-Komponenten.
 *
 * @note
 * Nutzt ein internes Ref (endRef), um nach jeder neuen Nachricht automatisch
 * zum unteren Ende des Chatverlaufs zu scrollen.
 * Es ist kein forwardRef und kein Ref vom Parent nötig.
 *
 * @component
 * @param {Object} props - Komponenteneigenschaften
 * @param {Array} props.messages - Array von Nachrichtenobjekten mit den Eigenschaften id, role, content
 * @param {Function} [props.onOptionClick] - Optional. Funktion, die aufgerufen wird, wenn ein Optionsbutton geklickt wird.
 * @returns {JSX.Element} Container mit der gerenderten Nachrichtenliste und automatischem Scrollen
 *
 * @example
 * const messages = [
 *   { id: 1, role: 'user', content: 'Hallo!' },
 *   { id: 2, role: 'bot', content: 'Wie kann ich helfen?' }
 * ];
 * <ChatWindow messages={messages} />
 */
const ChatWindow = ({ messages, onOptionClick }) => {
  // Ref auf das Dummy-Element am Ende des Chatverlaufs
  const endRef = useRef(null);

  // Scrollt nach jeder neuen Nachricht automatisch nach unten
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id || idx}
          message={msg}
          onButtonClick={onOptionClick}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
};

ChatWindow.propTypes = {
  messages: PropTypes.array.isRequired,
  onOptionClick: PropTypes.func,
};

export default ChatWindow;