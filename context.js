/**
 * Functions specific to the Context sheet.
 * Handles edits and updates JSON cache.
 */

/**
 * Handles edits in the Context sheet and updates JSON cache.
 * @param {Object} e - The event object from the edit trigger.
 */
function handleContextEdit(e) {
    try {
        debugLog('Handling Context sheet edit');
        const data = getSheetData("Context");
        const json = createContextJSON(data);
        const spreadsheet = e.source;
        const cacheKey = getCacheKey(spreadsheet);
        CacheService.getScriptCache().put(cacheKey, JSON.stringify(json));
        debugLog(`Final Context JSON: ${JSON.stringify(json)}`, true); // Always log the final JSON
    } catch (error) {
        Logger.log(`Error in handleContextEdit: ${error.message}`);
    }
}

/**
 * Retrieves data from the specified sheet.
 * @param {string} sheetName - The name of the sheet to retrieve data from.
 * @returns {Array} - The data from the sheet.
 */
function getSheetData(sheetName) {
    try {
        debugLog(`Retrieving data from sheet: ${sheetName}`);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
        return sheet.getDataRange().getValues();
    } catch (error) {
        Logger.log(`Error in getSheetData: ${error.message}`);
        return null;
    }
}

/**
 * Creates a JSON object from the Context sheet data efficiently.
 * This function processes the data from the Context sheet, creating a structured JSON object.
 * It handles nested structures based on the presence of a collection identifier in column A,
 * and creates key-value pairs from columns D and G.
 * 
 * @param {Array} data - The data from the Context sheet. Expected format:
 *                       [
 *                         [Header A, Header B, Header C, Header D, Header E, Header F, Header G],
 *                         [Collection, , , Key, , , Value],
 *                         ...
 *                       ]
 * @returns {Object} - The structured JSON object representing the Context data.
 * 
 * @example
 * // Input data:
 * // [
 * //   ["Header A", "Header B", "Header C", "Header D", "Header E", "Header F", "Header G"],
 * //   ["Collection1", "", "", "Key1", "", "", "Value1"],
 * //   ["Collection1", "", "", "Key2", "", "", "Value2"],
 * //   ["", "", "", "Key3", "", "", "Value3"],
 * //   ["Collection2", "", "", "Key4", "", "", '{"nestedKey": "nestedValue"}']
 * // ]
 * // 
 * // Output:
 * // {
 * //   "Collection1": {
 * //     "Key1": "Value1",
 * //     "Key2": "Value2"
 * //   },
 * //   "Key3": "Value3",
 * //   "Collection2": {
 * //     "Key4": {"nestedKey": "nestedValue"}
 * //   }
 * // }
 */
function createContextJSON(data) {
    try {
        const result = {};
        const grouped = {};
        const nonCollectionRows = [];

        // Batch process rows, skipping the header
        data.slice(1).forEach(row => {
            const [collection, , , key, , , value] = row;
            if (key && value !== undefined && value !== '') {
                if (collection) {
                    if (!grouped[collection]) grouped[collection] = [];
                    grouped[collection].push([key, value]);
                } else {
                    nonCollectionRows.push([key, value]);
                }
            }
        });

        // Process grouped data
        Object.entries(grouped).forEach(([collection, rows]) => {
            result[collection] = Object.fromEntries(rows);
        });

        // Handle non-collection rows
        Object.assign(result, Object.fromEntries(nonCollectionRows));

        // Batch parse values
        const allValues = Object.values(result).flatMap(obj => 
            obj instanceof Object ? Object.values(obj) : [obj]
        );
        const parsedValues = batchParseValues(allValues);

        // Assign parsed values back to the result
        let index = 0;
        Object.keys(result).forEach(key => {
            if (result[key] instanceof Object) {
                Object.keys(result[key]).forEach(subKey => {
                    result[key][subKey] = parsedValues[index++];
                });
            } else {
                result[key] = parsedValues[index++];
            }
        });

        return result;
    } catch (error) {
        Logger.log(`Error in createContextJSON: ${error.message}`);
        return {};
    }
}

/**
 * Parses multiple values efficiently.
 * @param {Array} values - Array of values to parse.
 * @returns {Array} - Array of parsed values.
 */
function batchParseValues(values) {
    return values.map(value => {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    });
}

/**
 * Parses the value from the sheet to the correct format.
 * @param {string|number|boolean|Object} value - The value to parse.
 * @returns {string|number|boolean|Object} - The parsed value.
 */
function parseValue(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

/**
 * Gets the cache key for context data.
 * @param {Object} spreadsheet - The active spreadsheet.
 * @returns {string} The cache key.
 */
function getCacheKey(spreadsheet) {
    const contextSheet = spreadsheet.getSheetByName("Context");
    const lastRow = contextSheet.getLastRow();
    return `contextData_${spreadsheet.getId()}_${lastRow}`;
}

// Export functions
this.handleContextEdit = handleContextEdit;
this.createContextJSON = createContextJSON;
this.getCacheKey = getCacheKey;
