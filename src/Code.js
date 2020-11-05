let scriptProperties = PropertiesService.getScriptProperties();

const demoRequest = { queryString:
                     'token=VmarGDGPn3Akw5Kt4xk4ETLwdAtpwcqH', 
                     parameter: { 
                       token: 'VmarGDGPn3Akw5Kt4xk4ETLwdAtpwcqH' 
                     }, 
                     postData: { 
                       contents: '{"update_id":41666741,\n"inline_query":{"id":"5885869108612766","from":{"id":1370410,"is_bot":false,"first_name":"Manglaneso","username":"loMasBonitoDelMundo","language_code":"en"},"query":"star","offset":""}}', 
                       length: 209, 
                       name: 'postData',
                       type: 'application/json' 
                     }, 
                     contentLength: 209, 
                     parameters: {
                       token: [
                         'VmarGDGPn3Akw5Kt4xk4ETLwdAtpwcqH' 
                       ]
                     },
                     contextPath: ''
                    }

/**
 * Enpoint suscribed as webhook in Telegram API which receives notifications once a message
 * is sent to the bot
 *
 * @param {object} request HTTP Request object received.
 */
function doPost(request=demoRequest) {
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
        if(inlineQuery['from'].hasOwnProperty('inline_query')) {
          var searchResults = searchMulti(searchQuery=query, language=inlineQuery['from']['language_code']);
        } else {
          var searchResults = searchMulti(searchQuery=query);
        }
        
        let page = searchResults['page'];
        
        //let totalPages = searchResults['total_pages'];
        
        let answers = [];
        
        let answersCount = 0;
        Logger.log('Total pages: ' + totalPages)
        
        while(page <= 5) {
          
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
          
          Logger.log('Answers length: ' + answers.length)
          Logger.log('Page: ' + page)
          page += 1;
          
          if(inlineQuery['from'].hasOwnProperty('inline_query')) {
            searchResults = searchMulti(searchQuery=query, page=page, language=inlineQuery['from']['language_code']);
          } else {
            searchResults = searchMulti(searchQuery=query, page=page);
          }
          
        }
        
        
        
        if(answers.length > 50) {
          if(inlineQuery['offset'] == '') {
             Logger.log(answerInlineQuery(inlineQuery, answers.slice(0, 50), cacheTime=1, offset=50));
          } else {
            let tempOffset = Number(inlineQuery['offset']);
             Logger.log(answerInlineQuery(inlineQuery, answers.slice(tempOffset, 50), cacheTime=1, offset=tempOffset+50));
          }
        } else {
           Logger.log(answerInlineQuery(inlineQuery, answers, cacheTime=1));
        }
        
        // Logger.log(answerInlineQuery(inlineQuery, answers.splice(0, 50), cacheTime=300));  
      }
              
    } else if(update.hasOwnProperty('message')) {
      let msg = update['message'];
      
      if(msg.hasOwnProperty('text')) {
        if(msg['text'].indexOf('/start ') > -1) {
          
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