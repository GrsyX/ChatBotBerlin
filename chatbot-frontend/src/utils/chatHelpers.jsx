import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Hilfsfunktionen für die Chat-Anwendung
 * - renderWithLinks: Macht URLs im Text anklickbar
 * - generateChatTitle: Erzeugt einen Chat-Titel mit Datum und Uhrzeit
 * - renderFormattedContent: Formatiert Nachrichtentext (Links, Zeilenumbrüche)
 */

/**
 * Macht URLs im Text anklickbar.
 * Gibt ein Array aus Text- und Link-Elementen zurück.
 * @param {string} text
 * @returns {Array|JSX.Element|null}
 */
export function renderWithLinks(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#b60606", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

/**
 * Erzeugt einen Chat-Titel mit laufender Nummer, Datum und Uhrzeit.
 * @param {number} index
 * @returns {string}
 */
export function generateChatTitle(index) {
  const now = new Date();
  const date = now.toLocaleDateString('de-DE');
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `Chat ${index}: ${date}, ${time} Uhr`;
}

/**
 * Formatiert den Nachrichtentext (z.B. Links, Zeilenumbrüche).
 * Kann bei Bedarf erweitert werden.
 * @param {string} text
 * @returns {JSX.Element|null}
 */
export function renderFormattedContent(text) {
  if (!text) return null;
  // Vor jedem "•" einen Zeilenumbruch einfügen, außer am Zeilenanfang
  const normalized = text.replace(/(?!^)(•)/g, '\n$1');
  const html = marked.parseInline(normalized);
  const clean = DOMPurify.sanitize(html);
  return <span style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: clean }} />;
}