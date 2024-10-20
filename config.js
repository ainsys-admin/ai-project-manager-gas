/**
 * Configuration file for storing constants and settings.
 * @module config
 */

/**
 * Main configuration object containing all settings and constants.
 * @const {Object}
 */
var CONFIG = {
  /**
   * Object containing all webhook URLs grouped by operation.
   * @const {Object}
   */
  WEBHOOKS: {
    GROOM_EPICS: "https://hook.eu2.make.com/rl83vjk9x0iad1avisatjk9rok27wgpy",
    GROOM_USER_STORIES_AND_TASKS: "",
    GROOM_SUBTASKS: "",
    ESTIMATE_SUBTASKS: "",
    // Add more webhook URLs here as needed
  },
  DEBUG: false // Set to true for detailed logging
};

/**
 * Retrieves the webhook URL for a specific operation.
 * @param {string} operation - The operation name for which to retrieve the webhook URL.
 * @returns {string|null} The webhook URL if found, null otherwise.
 */
function getWebhookUrl(operation) {
  try {
    if (CONFIG.DEBUG) Logger.log(`Retrieving webhook URL for operation: ${operation}`);
    return CONFIG.WEBHOOKS[operation] || null;
  } catch (error) {
    Logger.log(`Error in getWebhookUrl: ${error.message}`);
    return null;
  }
}

/**
 * Logs a message if debug mode is enabled or if it's a critical message.
 * @param {string} message - The message to log.
 * @param {boolean} [critical=false] - Whether the message is critical and should always be logged.
 */
function debugLog(message, critical = false) {
  if (CONFIG.DEBUG || critical) {
    Logger.log(message);
  }
}

// Export the functions and CONFIG object
this.CONFIG = CONFIG;
this.getWebhookUrl = getWebhookUrl;
this.debugLog = debugLog;
