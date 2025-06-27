/**
 * Chatbot API Service (Rasa-kompatibel, echtes Backend)
 *
 * Diese Datei stellt die Schnittstelle zur echten Rasa-REST-API bereit.
 * Die Funktion sendMessageToBot sendet eine Nachricht an das Rasa-Backend
 * und gibt die Antwort im gleichen Format wie die Rasa-REST-API zurück.
 *
 * @module api/chatbotApi
 */

/**
 * Sendet eine Nachricht an das Rasa-Backend (REST-API) und gibt die Antwort zurück.
 *
 * @function
 * @param {string} message - Die vom Benutzer eingegebene Nachricht.
 * @param {string} [sender="test-user"] - Eindeutige User-ID (z.B. Chat- oder Sitzungs-ID).
 *   // Rasa erwartet ein sender-Feld, um den Dialog-Status pro Nutzer zu speichern.
 * @returns {Promise<Array<{recipient_id: string, text: string}>>}
 * Gibt ein Promise zurück, das die Antwort des Rasa-Backends (Array von Nachrichtenobjekten) liefert.
 *
 * @example
 * sendMessageToBot("Hallo").then(
 *   res => console.log(res[0].text),
 *   err => console.error(err.message)
 * );
 */
export async function sendMessageToBot(message, sender = "user") {
  const response = await fetch("http://localhost:5011/webhooks/rest/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, message }),
  });
  if (!response.ok) {
    throw new Error("Bot-Server nicht erreichbar oder Fehler im Backend.");
  }
  return await response.json();
}