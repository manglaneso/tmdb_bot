let scriptProperties = PropertiesService.getScriptProperties();

/**
 * Enpoint suscribed as webhook in Telegram API which receives notifications once a message
 * is sent to the bot
 *
 * @param {object} request HTTP Request object received.
 */
function doPost(request) {
  console.log(request)
  if(checkTelegramAuth(request)) {
    let update = JSON.parse(request['postData']['contents']);
    
    console.log(update)
      
    // Make sure this is update is a type message
    if (update.hasOwnProperty('inline_query')) {
      let inlineQuery = update['inline_query'];
      
      console.info(JSON.stringify(inlineQuery));
      
      let query = inlineQuery['query'];
      
      if(query != '') {
        
        let page = 1;
        let nextOffset = 1;
        
        if(inlineQuery['offset'] !== '') {
          page = Number(inlineQuery['offset']) + 1;
          nextOffset = Number(inlineQuery['offset']) + 1;
        }
        
        if(inlineQuery['from'].hasOwnProperty('inline_query')) {
          var searchResults = searchMulti(searchQuery=query, language=inlineQuery['from']['language_code'], page=page);
        } else {
          var searchResults = searchMulti(searchQuery=query, page=page);
        }
        
        let answers = [];
        
        let answersCount = 0;
        for(let i in searchResults['results']) {
          if(searchResults['results'][i]['media_type'] == 'tv' || searchResults['results'][i]['media_type'] == 'movie') {
            let answer = {};
            
            answer['type'] = 'article';
            answer['id'] = String(answersCount);
            answer['thumb_url'] = imageBaseUrl + searchResults['results'][i]['poster_path'];
            answer['hide_url'] = true;
            
            if(searchResults['results'][i].hasOwnProperty('overview')) {
              answer['description'] = searchResults['results'][i]['overview'];
            }
            
            
            if(searchResults['results'][i].hasOwnProperty('title')) {
              answer['title'] = searchResults['results'][i]['title'];
            } else if(searchResults['results'][i].hasOwnProperty('name')) {
              answer['title'] = searchResults['results'][i]['name'];
            }
            
            let tmdbUrl = '';
            
            if(searchResults['results'][i]['media_type'] == 'tv') {
              tmdbUrl = tmdbBaseTvUrl + searchResults['results'][i]['id'];
            } else {
              tmdbUrl = tmdbBaseUrl + searchResults['results'][i]['id'];
            }
            
            answer['url'] = tmdbUrl;
            
            answer['input_message_content'] = {
              'message_text': generateTemplatedText(answer['title'], tmdbUrl, searchResults['results'][i]),
              'parse_mode': 'HTML'
            };
            
            answers.push(answer);
            answersCount += 1;
          }            
        }
        
        if(answers.length >= 20) {
          answerInlineQuery(inlineQuery, answers, cacheTime=300, nextOffset=nextOffset + 1);    
        } else {
          answerInlineQuery(inlineQuery, answers, cacheTime=300);    
        }
            
      }
              
    } else if(update.hasOwnProperty('message')) {
      let msg = update['message'];
      
      if(msg.hasOwnProperty('text')) {
        if(msg['text'].indexOf('/start') > -1) {
          handleStart(msg);
        } else {
          handleMessageDefault(msg);
        }
      }
    }
  }
}

function generateTemplatedText(title, tmdbUrl, searchResults) {
  let template = HtmlService.createTemplateFromFile('TMDB/views/inlineQuerySearchResult');
          
  let toTemplate = {
    'title': title,
    'mediaType': searchResults['media_type'],
    'releaseDate': searchResults['release_date'],
    'voteAverage': searchResults['vote_average'],
    'originalLanguage': searchResults['original_language'],
    'thumb_url': imageBaseUrl + searchResults['poster_path']    
  }
  
  if(searchResults.hasOwnProperty('overview')) {
    toTemplate['description'] = searchResults['overview'];
  } else {
    toTemplate['description'] = '';
  }
    
  if(searchResults['media_type'] == 'tv') {
    tmdbUrl = tmdbBaseTvUrl + searchResults['id'];
  } else {
    tmdbUrl = tmdbBaseUrl + searchResults['id'];
  }
  
  toTemplate['tmdbUrl'] = tmdbUrl;
  
  template['data'] = toTemplate;
  
  return template.evaluate().getContent();
}

function generateInlineKeyboardMarkup(buttonsArray) {
  let inlineKeyboardMarkup = {
    'inline_keyboard': buttonsArray
  };
  
  return inlineKeyboardMarkup;
  
}

function generateInlineKeyBoardButton(text, switchInlineQuery=null, switchInlineQueryCurrentChat=null) {
  let inlineKeyboardButton = {
    'text': text
  };
  
  if(switchInlineQuery || switchInlineQuery === '') {
    inlineKeyboardButton['switch_inline_query'] = switchInlineQuery
  }
  
  if(switchInlineQueryCurrentChat || switchInlineQueryCurrentChat === '') {
    inlineKeyboardButton['switch_inline_query_current_chat'] = switchInlineQueryCurrentChat
  }
  
  return inlineKeyboardButton; 
  
}

function handleStart(msg) {
  
  let localButton = generateInlineKeyBoardButton('🔍 Find me the movie/show', switchInlineQuery=null, switchInlineQueryCurrentChat="");
  let shareButton = generateInlineKeyBoardButton('↗️ Find & share movies/shows with friends', switchInlineQuery="", switchInlineQueryCurrentChat=null);
  
  let buttonsArray = [];
  buttonsArray.push([localButton]);
  buttonsArray.push([shareButton]);
  
  let inlineKeyboardMarkup = generateInlineKeyboardMarkup(buttonsArray);
  let msgText = "This bot can help you find and share movies. It works in any chat, just write @themoviedatabase_bot in the text field. Let's try!"
  sendMessage(msg, msgText, replyTo=false, replyMarkup=inlineKeyboardMarkup);
}

function handleMessageDefault(msg) {
  
  let queryText = msg['text'];
  let localButton = generateInlineKeyBoardButton('🔍 In this chat', switchInlineQuery=null, switchInlineQueryCurrentChat=queryText);
  let shareButton = generateInlineKeyBoardButton('↗️ Share to other chat', switchInlineQuery=queryText, switchInlineQueryCurrentChat=null);
  
  let buttonsArray = [];
  buttonsArray.push([localButton]);
  buttonsArray.push([shareButton]);
  
  let inlineKeyboardMarkup = generateInlineKeyboardMarkup(buttonsArray);
  let msgText = `You come to me and ask me to search for '<b>${queryText}</b>'. Now I ask you... where?`;
  sendMessage(msg, msgText, replyTo=false, replyMarkup=inlineKeyboardMarkup);
}
