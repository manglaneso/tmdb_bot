let scriptProperties = PropertiesService.getScriptProperties();

const telegramApi = TelegramBotAPI.client(scriptProperties.getProperty('TelegramBotApiToken'));

/**
 * Enpoint suscribed as webhook in Telegram API which receives notifications once a message
 * is sent to the bot
 *
 * @param {object} request HTTP Request object received.
 */
function doPost(request) {
  if(checkTelegramAuth(request)) {
    let update = JSON.parse(request['postData']['contents']);
          
    // Make sure this is update is a type message
    if (update.hasOwnProperty('inline_query')) {
      let inlineQuery = update['inline_query'];
      handleInlineQuery(inlineQuery);
              
    } else if(update.hasOwnProperty('message')) {
      let msg = update['message'];
      
      if(msg.hasOwnProperty('text')) {
        if(msg['text'].indexOf('/start') > -1) {
          handleStart(msg);
        } else {
          if(!msg.hasOwnProperty('via_bot')) {
            handleMessageDefault(msg);
          }
        }
      }
    }
  }
}

