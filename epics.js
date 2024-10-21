/**
 * Functions specific to the Epics sheet.
 * Handles edits and processes data for webhook.
 * 
 * This module contains functions for processing edits in the Epics sheet,
 * extracting relevant data, and sending it to a webhook. It includes
 * functionality for caching context data and creating JSON payloads.
 * 
 * @module EpicsModule
 */

/**
 * Handles edits in the Epics sheet and processes data for webhook.
 * This function is triggered when an edit occurs in the Epics sheet.
 * If the edit is in the correct column and has the correct value,
 * it extracts the relevant data and sends it to a webhook.
 * 
 * @param {Object} e - The event object from the edit trigger.
 */
function handleEpicsEdit(e) {
    try {
        debugLog('Handling Epics sheet edit');
        const sheet = e.source.getActiveSheet();
        const range = e.range;
        
        if (isExtractTodoSummariesTrigger(range)) {
            const rowData = getEventRowData(sheet, range);
            const contextData = getContextData(e.source);
            const json = createEpicsJSON(rowData, contextData, e);
            debugLog(`Final Epics JSON: ${JSON.stringify(json)}`, true); // Always log the final JSON
            sendToWebhook(json);
        }
    } catch (error) {
        Logger.log(`Error in handleEpicsEdit: ${error.message}`);
        // Consider implementing more detailed error reporting here
    }
}

/**
 * Checks if the edit should trigger Epics extraction.
 * 
 * @param {Object} range - The edited range.
 * @returns {boolean} True if extraction should be triggered.
 */
function isExtractTodoSummariesTrigger(range) {
    return range.getColumn() === 10 && range.getValue() === "Groom EPIC";
}

/**
 * Retrieves event row data.
 * 
 * @param {Object} sheet - The active sheet.
 * @param {Object} range - The edited range.
 * @returns {Object} The mapped row data.
 */
function getEventRowData(sheet, range) {
    debugLog('Getting event row data');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = sheet.getRange(range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    return getRowData(headers, rowData);
}

/**
 * Retrieves context data, using cache if available.
 * 
 * @param {Object} spreadsheet - The active spreadsheet.
 * @returns {Object} The context data.
 */
function getContextData(spreadsheet) {
    try {
        const cacheKey = getCacheKey(spreadsheet);
        let contextData = CacheService.getScriptCache().get(cacheKey);
        if (!contextData) {
            debugLog('Context data not found in cache, retrieving from sheet');
            const contextSheet = spreadsheet.getSheetByName("Context");
            const contextSheetData = contextSheet.getDataRange().getValues();
            contextData = createContextJSON(contextSheetData);
            CacheService.getScriptCache().put(cacheKey, JSON.stringify(contextData), 21600); // Cache for 6 hours
        } else {
            contextData = JSON.parse(contextData);
        }
        return contextData;
    } catch (error) {
        Logger.log(`Error in getContextData: ${error.message}`);
        return {}; // Return an empty object if there's an error
    }
}

/**
 * Retrieves row data and maps it to headers.
 * 
 * @param {Array} headers - The header row of the sheet.
 * @param {Array} row - The data row to process.
 * @returns {Object} The mapped row data.
 */
function getRowData(headers, row) {
    try {
        debugLog('Mapping row data to headers');
        return headers.reduce((obj, header, index) => {
            obj[header] = row[index];
            return obj;
        }, {});
    } catch (error) {
        Logger.log(`Error in getRowData: ${error.message}`);
        return {};
    }
}

/**
 * Creates a JSON object from the Epics sheet data.
 * 
 * @param {Object} data - The row data from the Epics sheet.
 * @param {Object} contextData - The cached context data.
 * @param {Object} e - The event object from the edit trigger.
 * @returns {Object} The JSON object combining event and context data, excluding empty values and including additional metadata.
 */
function createEpicsJSON(data, contextData, e = null) {
    try {
        debugLog('Creating Epics JSON');
        const json = {
            context: contextData,
            eventData: {},
        };

        if (e) {
            json.gsheet_id = e.source.getId();
            json.sheet_name_id = e.source.getActiveSheet().getName();
            json.row_id = e.range.getRow();
            json.user_id = Session.getActiveUser().getEmail();
            json.modify_time = new Date().toISOString();
        }

        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined && value !== '') {
                json.eventData[key] = value;
            }
        }

        return json;
    } catch (error) {
        Logger.log(`Error in createEpicsJSON: ${error.message}`);
        return {};
    }
}

// Export the functions
this.handleEpicsEdit = handleEpicsEdit;
this.createEpicsJSON = createEpicsJSON;
