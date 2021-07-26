/**
 * Checks if the update received in the web server comes from Telegram Bot API 
 *
 * @param {object} request Request received in web server
 *
 * @return {boolean} True if the message comes from Telegram Bot API, False otherwise
 *
 */
function checkTelegramAuth(request) {
  if(request['parameter'] && request['parameter']['token']) {
    return request['parameter']['token'] === scriptProperties.getProperty('TelegramAPIAuthToken')
  }
  
  return false;
}