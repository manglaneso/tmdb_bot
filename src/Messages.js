/**
 * Handle /start messages sent to the bot
 *
 */
function handleStart(msg) {
  
  let localButton = generateInlineKeyBoardButton('🔍 Find me the movie/show', switchInlineQuery=null, switchInlineQueryCurrentChat="");
  let shareButton = generateInlineKeyBoardButton('↗️ Find & share movies/shows with friends', switchInlineQuery="", switchInlineQueryCurrentChat=null);
  
  let buttonsArray = [];
  buttonsArray.push([localButton]);
  buttonsArray.push([shareButton]);
  
  let inlineKeyboardMarkup = generateInlineKeyboardMarkup(buttonsArray);
  let msgText = "This bot can help you find and share movies. It works in any chat, just write @themoviedatabase_bot in the text field. Let's try!"
  telegramApi.sendMessage(msg, msgText, replyTo=false, replyMarkup=inlineKeyboardMarkup);
}

/**
 * Handle every other messages sent to the bot
 *
 */
function handleMessageDefault(msg) {
  
  let queryText = msg['text'];
  let localButton = generateInlineKeyBoardButton('🔍 In this chat', switchInlineQuery=null, switchInlineQueryCurrentChat=queryText);
  let shareButton = generateInlineKeyBoardButton('↗️ Share to other chat', switchInlineQuery=queryText, switchInlineQueryCurrentChat=null);
  
  let buttonsArray = [];
  buttonsArray.push([localButton]);
  buttonsArray.push([shareButton]);
  
  let inlineKeyboardMarkup = generateInlineKeyboardMarkup(buttonsArray);
  let msgText = `You come to me and ask me to search for '<b>${queryText}</b>'. Now I ask you... where?`;
  telegramApi.sendMessage(msg, msgText, replyTo=false, replyMarkup=inlineKeyboardMarkup);
}
