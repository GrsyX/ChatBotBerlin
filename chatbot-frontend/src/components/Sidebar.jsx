import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, Settings, Moon, Sun } from "lucide-react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import "./Sidebar.css";

/**
 * Sidebar-Komponente
 *
 * Stellt die Seitenleiste mit Chatverwaltung, Ein-/Ausklappfunktion,
 * Darkmode-Toggle und Schriftgrößenregler dar.
 *
 * @component
 * @param {Object} props - Komponenteneigenschaften
 * @param {boolean} props.isSidebarOpen - Status der Sidebar (offen/zu)
 * @param {Array} props.chats - Liste der Chats
 * @param {number} props.activeChatId - ID des aktiven Chats
 * @param {Function} props.setActiveChatId - Funktion zum Wechseln des aktiven Chats
 * @param {Function} props.createNewChat - Funktion zum Erstellen eines neuen Chats
 * @param {Function} props.deleteChat - Funktion zum Löschen eines Chats
 * @param {Function} props.deleteAllChats - Funktion zum Löschen aller Chats
 * @param {number} props.fontSize - Aktuelle Schriftgröße
 * @param {Function} props.setFontSize - Funktion zum Setzen der Schriftgröße
 * @returns {JSX.Element} Die Sidebar-Komponente
 */
const Sidebar = ({
  isSidebarOpen,
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat,
  deleteChat,
  deleteAllChats,
  fontSize,
  setFontSize,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const resetFont = () => setFontSize(1);

  return (
    <aside className={`sidebar${isSidebarOpen ? " open" : " closed"}`}>
      {/* Sidebar Header ohne Toggle-Button */}
      <div className="sidebar-header">
        {isSidebarOpen && (
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={18} />
            <span>Neuer Chat</span>
          </button>
        )}
      </div>
      {isSidebarOpen && (
        <>
          {/* Chatverlauf */}
          <div className="sidebar-content">
            <h2 className="sidebar-title">Chatverlauf</h2>
            <ul className="conversation-list">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className={`conversation-item${
                    activeChatId === chat.id ? " active" : ""
                  }`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="conversation-icon-title">
                    <div className="conversation-icon">
                      <MessageSquare size={16} />
                    </div>
                    <span className="conversation-title">{chat.title}</span>
                  </div>
                  <button
                    className={`delete-btn${
                      chats.length > 1 ? "" : " hide"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    title="Diesen Chat löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Footer mit Einstellungen und Alle-löschen-Button */}
          <div className="sidebar-footer">
            <button
              className="settings-btn"
              aria-label="Einstellungen"
              onClick={() => setShowSettings((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Settings size={22} strokeWidth={2.2} />
              Einstellungen
            </button>
            {showSettings && (
              <div className="settings-panel">
                {/* Schriftgröße-Einstellung */}
                <div className="settings-title">Schriftgröße</div>
                <Box
                  sx={{
                    width: 180,
                    margin: "1rem auto",
                    display: "block",
                  }}
                >
                  <Slider
                    size="small"
                    min={0.67}
                    max={2}
                    step={0.01}
                    value={fontSize}
                    onChange={(_, value) => setFontSize(value)}
                    valueLabelDisplay="auto"
                    aria-label="Schriftgröße"
                    marks={[
                      { value: 0.67, label: "67%" },
                      { value: 1, label: "100%" },
                      { value: 2, label: "200%" },
                    ]}
                    sx={{ margin: "0 auto", display: "block" }}
                  />
                </Box>
                <button
                  type="button"
                  onClick={resetFont}
                  className="reset-font-btn"
                >
                  Zurücksetzen
                </button>

                {/* Trennlinie */}
                <div className="darkmode-separator"></div>

                {/* Neue Überschrift für Darkmode */}
                <div className="settings-title">Motiv</div>

                <button
                  type="button"
                  className="darkmode-toggle-btn"
                  onClick={() => setDarkMode((d) => !d)}
                >
                  <span className="darkmode-btn-icon">
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  <span className="darkmode-btn-text">
                    {darkMode ? "Hell" : "Dunkel"}
                  </span>
                </button>
              </div>
            )}
            <button className="delete-all-btn" onClick={deleteAllChats}>
              <Trash2 size={16} />
              <span>Alle löschen</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;