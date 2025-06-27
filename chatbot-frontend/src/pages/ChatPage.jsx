import { ShieldQuestion, Menu } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';
import './ChatPage.css';
import { sendMessageToBot } from '../api/chatbotApi';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ConsentModal from '../components/ConsentModal';
// Hilfsfunktionen und Konstanten importieren
import { LANGUAGES, GREETINGS, LANGUAGE_CHANGED, FIRST_BOT_ID, WELCOME_MESSAGE } from '../utils/constants.jsx';
import { renderWithLinks, generateChatTitle, renderFormattedContent } from '../utils/chatHelpers.jsx';
/**
 * ChatPage Komponente - Hauptseite der Chat-Anwendung
 *
 * Stellt die Benutzeroberfläche für die Interaktion mit dem AmtBot bereit,
 * bestehend aus einem Chat-Verlauf und einem Eingabebereich. Verwaltet
 * den Chatverlauf und verarbeitet Benutzereingaben.
 *
 * @component
 * @returns {JSX.Element} Die gerenderte ChatPage-Komponente
 */
const ChatPage = () => {
  const [consent, setConsent] = useState(false);
  // Chatverlauf beim Laden der Seite wiederherstellen
  const storedData = JSON.parse(localStorage.getItem('chatbot_chat_data'));
  const [input, setInput] = useState(''); // Speichert die aktuelle Benutzereingabe
  const [isBotResponding, setIsBotResponding] = useState(false); // Blockiert Senden während Bot antwortet
  const [language, setLanguage] = useState(null); // Aktuell gewählte Sprache
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState(1);
  const [isSending, setIsSending] = useState(false);
  // Chatliste im State verwalten
  const [chats, setChats] = useState(
    storedData?.chats || [{ id: 1, title: generateChatTitle(1) }]
  );
  const [activeChatId, setActiveChatId] = useState(
    storedData?.activeChatId || 1
  );
  const [chatMessages, setChatMessages] = useState(
    storedData?.chatMessages || { 1: [WELCOME_MESSAGE] }
  );
  // Hilfsfunktion: Aktuelle Nachrichten
  const messages = chatMessages[activeChatId] || [];
  // Funktion zum Hinzufügen eines neuen Chats
  const createNewChat = () => {
    const newId = chats.length > 0 ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    const newChat = {
      id: newId,
      title: generateChatTitle(chats.length + 1),
    };
    setChats([...chats, newChat]);
    setActiveChatId(newId);
    setChatMessages((prev) => ({
      ...prev,
      [newId]: [WELCOME_MESSAGE]
    }));
  };
  // Funktion zum Wechseln des aktiven Chats
  const handleSetActiveChatId = (id) => {
    setActiveChatId(id);
    // Falls noch kein Verlauf existiert, Willkommensnachricht anlegen
    setChatMessages((prev) => ({
      ...prev,
      [id]: prev[id] || [WELCOME_MESSAGE]
    }));
  };
  // Funktion zum Löschen eines einzelnen Chats
  const deleteChat = (id) => {
    if (chats.length === 1) {
      setChatMessages((prev) => ({
        ...prev,
        [id]: [WELCOME_MESSAGE]
      }));
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === id
            ? { ...chat, title: generateChatTitle(1) }
            : chat
        )
      );
      return;
    }
    // Mehrere Chats: Chat wirklich löschen
    const filtered = chats.filter(chat => chat.id !== id);
    setChats(filtered);
    setChatMessages((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    // Falls der gelöschte Chat aktiv war, auf den ersten Chat umschalten
    if (activeChatId === id && filtered.length > 0) {
      setActiveChatId(filtered[0].id);
    }
  };
  // Funktion zum Löschen aller Chats mit Bestätigungsdialog und automatisches Anlegen eines neuen Chats
  const deleteAllChats = () => {
    if (window.confirm("Möchten Sie wirklich alle Chats löschen?")) {
      const newId = 1;
      const newChat = { id: newId, title: generateChatTitle(1) };
      setChats([newChat]);
      setActiveChatId(newId);
      setChatMessages({ [newId]: [WELCOME_MESSAGE] });
    }
  };
  /**
   * Verarbeitet das Absenden einer Nachricht
   *
   * @description
   * - Prüft auf leere Eingaben
   * - Blockiert sofort weiteres Senden (auch bei schnellem Enter)
   * - Fügt die Benutzernachricht zum Chat hinzu
   * - Setzt das Eingabefeld zurück
   * - Holt die Bot-Antwort über die API
   * - Gibt das Senden erst nach Bot-Antwort wieder frei
   */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isBotResponding) return;
    setIsBotResponding(true);
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), userMessage]
    }));
    setInput('');
    try {
      // KEINE Übersetzung mehr im Frontend!
      const rasaResponses = await sendMessageToBot(text, String(activeChatId));
      const botMessages = rasaResponses.map((resp, idx) => ({
        id: Date.now() + 1 + idx,
        role: 'bot',
        content: resp.text,
        buttons: resp.buttons
      }));
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          ...botMessages
        ]
      }));
    } catch (error) {
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          {
            id: Date.now() + 999,
            role: 'bot',
            content: error.message || 'Es ist ein Fehler aufgetreten.'
          }
        ]
      }));
    } finally {
      setIsBotResponding(false);
    }
  };
  /**
   * Verarbeitet die Auswahl einer Sprache
   *
   * @param {string} langCode - Sprachcode (z.B. 'de', 'en', ...)
   * @description
   * - Fügt die Auswahl als User-Nachricht in den Verlauf ein
   * - Sendet einen Sprachwechsel-Intent an das Backend,
   *   damit der Slot "language" im Backend gesetzt wird!
   * - Die Bot-Antworten kommen übersetzt zurück.
   */
  const handleLanguageSelect = async (langCode) => {
    setLanguage(langCode);
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        {
          id: Date.now(),
          role: 'user',
          content: LANGUAGES.find((l) => l.code === langCode)?.label || langCode
        }
      ]
    }));
    setIsBotResponding(true); // Ladeindikator AN
    try {
      // Sende Sprachwechsel-Intent an das Backend!
      const rasaResponses = await sendMessageToBot(`/language_select{"language":"${langCode}"}`, String(activeChatId));
      // Bot-Antworten in den Chatverlauf einfügen!
      const botMessages = rasaResponses.map((resp, idx) => ({
        id: Date.now() + 1 + idx,
        role: 'bot',
        content: resp.text,
        buttons: resp.buttons
      }));
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          ...botMessages
        ]
      }));
    } catch (error) {
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          {
            id: Date.now() + 999,
            role: 'bot',
            content: error.message || 'Der Chatbot ist aktuell nicht erreichbar. Bitte versuche es später erneut.'
          }
        ]
      }));
    } finally {
      setIsBotResponding(false); // Ladeindikator AUS
    }
  };
  // Referenz auf das Eingabefeld für automatischen Fokus nach Sprachauswahl
  const inputRef = useRef(null);
  useEffect(() => {
    if (language && inputRef.current) {
      inputRef.current.focus();
    }
  }, [language]);
  // Zwei Refs für die beiden ChatWindow-Komponenten
  const chatWindowRefs = [useRef(null), useRef(null)];
  /**
   * Automatisches Scrollen: Nach jeder Änderung der Nachrichten scrollen beide ChatWindows nach unten.
   */
  useEffect(() => {
    chatWindowRefs.forEach(ref => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    });
  }, [messages]);
  /**
   * Rendert den Chatverlauf und fügt die Sprachwahl-Buttons
   * immer nach der ersten Botnachricht ein.
   * Die Buttons bleiben immer an dieser Stelle anklickbar.
   *
   * Beide ChatWindow-Komponenten erhalten jeweils ein eigenes Ref für das automatische Scrollen.
   */
  const renderChatWithLanguageButtons = () => {
    const firstBotIdx = messages.findIndex(
      (msg) => msg.role === 'bot' && msg.id === FIRST_BOT_ID
    );
    if (firstBotIdx === -1) {
      // Falls Willkommensnachricht fehlt, normalen Verlauf anzeigen
      return <ChatWindow ref={chatWindowRefs[0]} messages={messages} />;
    }
    // Split: alles bis inkl. erster Bot-Nachricht, dann Buttons, dann Rest
    const before = messages.slice(0, firstBotIdx + 1);
    const after = messages.slice(firstBotIdx + 1);
    return (
      <>
        <ChatWindow ref={chatWindowRefs[0]} messages={before} onOptionClick={handleBotButtonClick} />
        <div className="language-select-buttons-row">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`language-btn${lang.code === 'ar' ? ' rtl' : ''}`}
              aria-label={lang.label}
            >
              {lang.label}
            </button>
          ))}
        </div>
        {after.length > 0 && (
          <ChatWindow
            ref={chatWindowRefs[1]}
            messages={after}
            onOptionClick={handleBotButtonClick}
          />
        )}
        {isBotResponding && <CircularIndeterminate />}
      </>
    );
  };
  // Chatverlauf im LocalStorage speichern
  useEffect(() => {
    const data = {
      chats,
      chatMessages,
      activeChatId,
    };
    localStorage.setItem('chatbot_chat_data', JSON.stringify(data));
  }, [chats, chatMessages, activeChatId]);
  // State für das Datenschutzhinweis-Modal
  const [showPrivacy, setShowPrivacy] = useState(false);
  /**
   * Rendert die Nachrichten im Chatverlauf für die aktuelle Unterhaltung.
   * Fügt einen Ladeindikator hinzu, während der Bot antwortet.
   *
   * @returns {JSX.Element} Die gerenderten Nachrichten
   */
  const renderMessages = () => {
    const messages = chatMessages[activeChatId] || [];
    return (
      <>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={msg.role === "user" ? "user-message" : "bot-message"}>
            {/* Bot-Avatar */}
            {msg.role === "bot" && (
              <img
                src={require('../assets/bear.png')}
                alt="Bot Avatar"
                className="chatbot-avatar"
              />
            )}
            {/* Nachrichtentext, falls vorhanden */}
            {msg.content && <p className="chat-text">{renderWithLinks(msg.content)}</p>}
            {/* Buttons IMMER anzeigen */}
            {msg.buttons && msg.buttons.length > 0 && (
              <div className="bot-buttons">
                {msg.buttons.map((btn, bidx) => (
                  <button
                    key={bidx}
                    className="service-btn"
                    onClick={() => handleBotButtonClick(btn)}
                  >
                    {btn.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isBotResponding && <CircularIndeterminate />}
      </>
    );
  };
  // Funktion zum Senden einer Benutzernachricht basierend auf einem Button-Klick
  function handleBotButtonClick(btn) {
    // 1. User-Nachricht im Chat anzeigen (nur Titel!)
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        {
          id: Date.now(),
          role: 'user',
          content: btn.title
        }
      ]
    }));
    // 2. An den Bot senden (payload, falls vorhanden, sonst title)
    sendMessageToBot(btn.payload || btn.title, String(activeChatId))
      .then((responses) => {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [
            ...(prev[activeChatId] || []),
            ...responses.map((resp, idx) => ({
              id: Date.now() + 1 + idx,
              role: 'bot',
              content: resp.text,
              buttons: resp.buttons
            }))
          ]
        }));
      })
      .catch((error) => {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [
            ...(prev[activeChatId] || []),
            {
              id: Date.now() + 999,
              role: 'bot',
              content: error.message || 'Es ist ein Fehler aufgetreten.'
            }
          ]
        }));
      });
  }
  const handleConsent = () => {
    localStorage.setItem("chatConsent", "true");
    setConsent(true);
  };
  return (
    <>
      {!consent && <ConsentModal onConsent={handleConsent} />}
      <div className="chat-page">
        {/* Sidebar bleibt wie gehabt */}
        <Sidebar
          fontSize={fontSize}
          setFontSize={setFontSize}
          isSidebarOpen={isSidebarOpen}
          chats={chats}
          activeChatId={activeChatId}
          setActiveChatId={handleSetActiveChatId}
          createNewChat={createNewChat}
          deleteChat={deleteChat}
          deleteAllChats={deleteAllChats}
        />
        <div className="chat-content">
          {/* Kopfzeile der Chat-Anwendung mit Toggle-Button */}
          <header className="chat-header">
            <button
              className="sidebar-toggle-header"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? "Sidebar schließen" : "Sidebar öffnen"}
            >
              <Menu size={22} />
            </button>
            <span className="header-title">
              AmtBot Treptow‑Köpenick
            </span>
            <button
              className="privacy-btn"
              aria-label="Datenschutzhinweis anzeigen"
              onClick={() => setShowPrivacy(true)}
            >
              <ShieldQuestion
                size={28}
                className="privacy-icon"
              />
            </button>
          </header>
          {/* Datenschutzhinweis-Modal */}
          {showPrivacy && (
            <div className="privacy-modal-overlay">
              <div className="privacy-modal">
                <button
                  className="privacy-modal-close"
                  onClick={() => setShowPrivacy(false)}
                  aria-label="Schließen"
                >
                  ×
                </button>
                <h2>Datenschutzhinweis</h2>
                <span style={{ whiteSpace: 'pre-line' }}>
                {`Ihr Chatverlauf wird ausschließlich lokal in Ihrem Browser gespeichert und kann jederzeit über den Button „Chatverlauf löschen“ entfernt werden.
                Um Ihre Anfragen zu beantworten, werden Ihre eingegebenen Nachrichten temporär an unseren Server übertragen und verarbeitet.
                
                Es erfolgt keine dauerhafte Speicherung Ihrer Chatdaten auf dem Server.
                Eine Weitergabe an Dritte findet nicht statt.`}
                </span>
              </div>
            </div>
          )}
          {/* Hauptbereich: Anzeige des Chatverlaufs */}
          <div
            className="chat-main-area"
            style={{ fontSize: `${fontSize}em` }}
          >
            <div className="bear-watermark" />
            {renderChatWithLanguageButtons()}
          </div>
          {/* Eingabebereich: Textfeld und Senden-Button */}
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              ref={inputRef}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isBotResponding) handleSend();
              }}
              placeholder="Ihre Nachricht…"
            />
            <button
              onClick={handleSend}
              disabled={isBotResponding || isSending}
              className={isBotResponding || isSending ? 'send-btn disabled' : 'send-btn'}
              type="submit"
            >
              {isSending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Senden"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
function CircularIndeterminate() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <CircularProgress color="error" />
    </Box>
  );
}
export default ChatPage;
