/**
 * Handle inline queries from the different Telegram clients
 *
 * @param {object} inlineQuery Inline query received from Telegram client
 */
function handleInlineQuery(inlineQuery) {
  let query = inlineQuery['query'];
      
  if(query !== '') {
    
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
      if(searchResults['results'][i]['media_type'] === 'tv' || searchResults['results'][i]['media_type'] === 'movie') {
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
        
        if(searchResults['results'][i]['media_type'] === 'tv') {
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
      telegramApi.answerInlineQuery(inlineQuery, answers, cacheTime=300, nextOffset=nextOffset + 1);
    } else {
      telegramApi.answerInlineQuery(inlineQuery, answers, cacheTime=300);
    }
    
  }
}

/**
 * Generates InlineKeyboardMarkup object
 *
 * @param {array} buttonsArray Array of arrays with InlineKeyboardButtons
 * @return {object} InlineKeyboardMarkup object generated
 */
function generateInlineKeyboardMarkup(buttonsArray) {
  return {
    'inline_keyboard': buttonsArray
  };
  
}

/**
 * Generates InlineKeyboardButton object with switchInlineQuery or switchInlineQueryCurrentChat
 *
 * @param {string} text Text of the button
 * @param {object} switchInlineQuery Optional query to be passed to the bot on the same chat
 * @return {object} switchInlineQueryCurrentChat Optional query to be passed to the bot on a different chat
 */
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

/**
 * Generates templated message to be returned by InlineQuery
 *
 * @param {string} title Title of the movie/TV show
 * @param {string} tmdbUrl TMDB URL of the movie/TV show
 * @param {object} searchResults Object representing a movie/TV with info from TMDB
 * @return {string} Rendered template
 */
function generateTemplatedText(title, tmdbUrl, searchResults) {
  let template = HtmlService.createTemplateFromFile('InlineQuery/views/inlineQuerySearchResult');
          
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
    
  if(searchResults['media_type'] === 'tv') {
    tmdbUrl = tmdbBaseTvUrl + searchResults['id'];
  } else {
    tmdbUrl = tmdbBaseUrl + searchResults['id'];
  }
  
  toTemplate['tmdbUrl'] = tmdbUrl;
  
  template['data'] = toTemplate;
  
  return template.evaluate().getContent();
}