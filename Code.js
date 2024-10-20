/**
 * Main script file for handling edits and webhook communication.
 * @module main
 */

/**
 * Main edit handler function.
 * Routes edit events to specific handlers based on the sheet name and range.
 * @param {Object} e - The event object from the edit trigger.
 */
function handleEdit(e) {
    try {
        debugLog('Handling edit event');
        const sheet = e.source.getActiveSheet();
        const sheetName = sheet.getName();

        if (sheetName === "Context") {
            handleContextEdit(e);
        } else if (sheetName === "Epics") {
            handleEpicsEdit(e);
        }
    } catch (error) {
        Logger.log(`Error in handleEdit: ${error.message}`);
    }
}

/**
 * Sends JSON data to the specified webhook.
 * @param {Object} json - The JSON object to be sent.
 * @throws {Error} If the webhook request fails.
 */
function sendToWebhook(json) {
    try {
        debugLog('Sending data to webhook');
        const webhookUrl = getWebhookUrl('GROOM_EPICS');
        if (!webhookUrl) throw new Error('Webhook URL not found');

        const options = {
            'method': 'post',
            'contentType': 'application/json',
            'payload': JSON.stringify(json)
        };

        debugLog(`Webhook URL: ${webhookUrl}`, true); // Always log the webhook URL
        debugLog(`Payload: ${JSON.stringify(json)}`, true); // Always log the payload

        const response = UrlFetchApp.fetch(webhookUrl, options);
        debugLog(`Webhook response: ${response.getResponseCode()}`, true); // Always log the response code

        if (response.getResponseCode() !== 200) {
            throw new Error(`Webhook request failed with status ${response.getResponseCode()}`);
        }
    } catch (error) {
        Logger.log(`Error in sendToWebhook: ${error.message}`);
    }
}

// Export the main function
this.handleEdit = handleEdit;
this.sendToWebhook = sendToWebhook;
