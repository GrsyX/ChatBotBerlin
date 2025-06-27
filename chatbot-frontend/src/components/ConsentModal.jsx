import React, { useState } from "react";
import "./ConsentModal.css";

/**
 * ConsentModal-Komponente
 * Zeigt ein Overlay mit Datenschutzhinweis und Einwilligungs-Checkbox an.
 * Erst nach Zustimmung kann der Chat genutzt werden.
 *
 * Props:
 * - onConsent: Funktion, die beim Klick auf "Zustimmen" ausgeführt wird
 */
export default function ConsentModal({ onConsent }) {
  // State für den Status der Checkbox (ob zugestimmt wurde)
  const [checked, setChecked] = useState(false);

  return (
    // Overlay, das den gesamten Bildschirm abdeckt
    <div className="consent-modal-overlay">
      {/* Modal-Inhalt */}
      <div className="consent-modal-content">
        <h2>Datenschutzhinweis</h2>
        <p>
          {/* Datenschutzhinweis-Text mit gezielten Hervorhebungen */}
          <strong>Ihr Chatverlauf wird ausschließlich lokal in Ihrem Browser gespeichert</strong> und kann jederzeit über den Button <u>„Chatverlauf löschen“</u> entfernt werden.<br /><br />
          Um Ihre Anfragen zu beantworten, werden Ihre eingegebenen Nachrichten <strong>temporär an unseren Server übertragen</strong> und verarbeitet.<br /><br />
          Es erfolgt <strong>keine dauerhafte Speicherung</strong> Ihrer Chatdaten auf dem Server.<br /><br />
          <strong>Eine Weitergabe an Dritte findet nicht statt.</strong>
        </p>
        {/* Checkbox für die Einwilligung */}
        <label className="consent-checkbox-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
          />
          Ich habe den Datenschutzhinweis gelesen und bin einverstanden.
        </label>
        {/* Zustimmen-Button, nur aktiv wenn Checkbox angehakt */}
        <button
          className="consent-modal-button"
          onClick={onConsent}
          disabled={!checked}
        >
          Zustimmen
        </button>
      </div>
    </div>
  );
}