const apiTelegramBotBaseUrl = 'https://api.telegram.org/bot';

const apiToken = scriptProperties.getProperty('TelegramBotApiToken');

/**
 * Gets info about current Telegram API Webhook
 *
 * @return {object} JSON search result resource returned by Telegram API
 */
function getWebhookInfo() {
  let result = UrlFetchApp.fetch(`${apiTelegramBotBaseUrl}${apiToken}/getWebhookInfo`).getContentText();
  Logger.log(result);
  return JSON.parse(result);
}

/**
 * Sets a new Webkhook to receive updates from Telegram API
 *
 * @return {object} JSON search result resource returned by Telegram API
 */
function setWebhook() {
  
  let webhookUrl = scriptProperties.getProperty('WebhookUrl');
  let telegramApiAuthToken = scriptProperties.getProperty('TelegramAPIAuthToken');
  
  let payload = {
    'method': 'setWebhook',
    'allowed_updates': []
  }

  let data = {
    'method': 'POST',
    'payload': payload
  }
  
  let result = UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/setWebhook?url=' + webhookUrl + '?token=' + telegramApiAuthToken, data).getContentText();
  Logger.log(result);
  return JSON.parse(result);
}


/**
 * Deletes current Webkhook to stop receiving updates from Telegram API
 *
 * @return {object} JSON search result resource returned by Telegram API
 */
function deleteWebHook() {
  
  let webhookUrl = scriptProperties.getProperty('WebhookUrl');
  let telegramApiAuthToken = scriptProperties.getProperty('TelegramAPIAuthToken');
  
  let payload = {
    'method': 'deleteWebhook'
  }

  let data = {
    'method': 'POST',
    'payload': payload
  }
  
  let result = UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/deleteWebhook', data).getContentText();
  Logger.log(result);
  return JSON.parse(result);
}

/**
 * Sends text message to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {string} message Message to send to chat
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 * @param {object} replyMarkup 
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendMessage(msg, message, replyTo=false, replyMarkup=null) {
  let payload = {
    'method': 'sendMessage',
    'chat_id': String(msg['chat']['id']),
    'text': message,
    'parse_mode': 'HTML'
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = msg['message_id']
  }
  
  if(replyMarkup) {
    payload['reply_markup'] = JSON.stringify(replyMarkup)
  }

  let data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }
  
  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());
}

/**
 * Sends photo to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {File} photo Google Drive File object of the photo to send
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 * @param {string} caption Text to send as caption of the photo
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendPhoto(msg, photo, replyTo=false, caption=null) {
  Logger.log(msg);
  let payload = {
    'method': 'sendPhoto',
    'chat_id': String(msg['chat']['id']),
    'photo': photo.getBlob(),
    'parse_mode': 'HTML'
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = String(msg['message_id']);
  }
  
  if(caption) {
    payload['caption'] = caption;
  }
  
  let data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());  
}

// TODO: Cambiar gestión de nombre
/**
 * Sends document to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {File} document Google Drive File object of the document to send
 * @param {string} name Name of the document to send
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendDocument(msg, document, name, replyTo=false) {
  let payload = {
    'method': 'sendDocument',
    'chat_id': String(msg['chat']['id']),
    'document': document.getBlob().setName(name)
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = String(msg['message_id']);
  }

  let data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());  
}

/**
 * Sends animation (GIF) to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {File} animation Google Drive File object of the animation to send
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendAnimation(msg, animation, replyTo=false) {
  let payload = {
    'method': 'sendAnimation',
    'chat_id': String(msg['chat']['id']),
    'animation': animation.getBlob()
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = String(msg['message_id']);
  }

  let data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());  
}

/**
 * Sends voice file to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {File} voice Google Drive File object of the voice to send
 * @param {caption} Text to send as caption of the photo
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendVoice(msg, voice, caption=null, replyTo=false) {
  
  let payload = {
    'method': 'sendVoice',
    'chat_id': String(msg['chat']['id']),
    'voice': voice.getBlob()
  }
  
  if(caption) {
    payload['caption'] = caption;
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = String(msg['message_id']);
  }

  var data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());  
}

/**
 * Sends location to a Telegram chat represented in msg object
 *
 * @param {object} msg Telegram API message resource
 * @param {float} latitude Latitude of the location to be sent
 * @param {float} longitude Longitude of the location to be sent
 * @param {boolean} replyTo True if the message to send is a reply to the provided message
 *
 * @return {object} JSON response returned by Telegram API
 */
function sendLocation(msg, latitude, longitude, replyTo=false) {
  let payload = {
    'method': 'sendLocation',
    'chat_id': String(msg['chat']['id']),
    'latitude': latitude,
    'longitude': longitude
  }
  
  if(replyTo) {
    payload['reply_to_message_id'] = msg['message_id']
  }

  let data = {
    'method': 'POST',
    'payload': payload
  }
  
  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());
}

/**
 * Gets a file from Telegram server
 *
 * @param {string} fileID ID of the file to get
 *
 * @return {object} JSON response returned by Telegram API
 */
function getFile(fileID) {
  let payload = {
    'method': 'getFile',
    'file_id': fileID
  }
  
  let data = {
    'method': 'GET',
    'payload': payload,
    'muteHttpExceptions': true
  }
  
  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());
}

/**
 * Downloads a file from Telegram server
 *
 * @param {string} fileID ID of the file to download
 *
 * @return {blob} Blob of the downloaded file
 */
function downloadFile(fileResource) {
  let result = UrlFetchApp.fetch('https://api.telegram.org/file/bot' + apiToken + '/' + fileResource['result']['file_path']);
  
  return result.getBlob();
}

/**
 * Gets chat information
 *
 * @param {string} chatId ID of the chat to get information of
 *
 * @return {object} JSON response returned by Telegram API
 */
function getChat(chatId) {
  let payload = {
    'method': 'getChat',
    'chat_id': chatId
  }

  let data = {
    'method': 'GET',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());
}

/**
 * Answer to an Telegram's inline query 
 *
 * @param {object} inlineQuery Telegram API inline query resource
 * @param {array} results Array of answer results to the inline query
 * @param {number} chacheTime The maximum amount of time in seconds that the result of the inline query may be cached on the server
 *
 * @return {object} JSON response returned by Telegram API
 */
function answerInlineQuery(inlineQuery, results, cacheTime=1, nextOffset='', isPersonal=true) {
    
  var payload = {
    'method': 'answerInlineQuery',
    'inline_query_id': inlineQuery['id'],
    'results': JSON.stringify(results),
    'cache_time': cacheTime,
    'next_offset': String(nextOffset),
    'is_personal': isPersonal
  }

  var data = {
    'method': 'POST',
    'payload': payload,
    'muteHttpExceptions': true
  }

  return JSON.parse(UrlFetchApp.fetch(apiTelegramBotBaseUrl + apiToken + '/', data).getContentText());  
}
