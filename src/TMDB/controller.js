const baseUrl = 'https://api.themoviedb.org/';
const version = '3';

const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const imdbBaseUrl = 'https://www.imdb.com/title/';
const tmdbBaseUrl = 'https://www.themoviedb.org/movie/';
const tmdbBaseTvUrl = 'https://www.themoviedb.org/tv/';


/**
 * Function to search for a movie/TV show in TMDB
 *
 * @param {string} searchQuery Movie/TV show to be searched
 * @return {object} JSON search result resource returned by TMDB API
 */
function searchMulti(searchQuery='dogma', page=1, language='en') {
    
  let apiKey = scriptProperties.getProperty('TmdbApiKey');
  
  let url = `${baseUrl}${version}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&page=${page}&language=${language}`
  
  let options = {
    method: 'GET',
    muteHttpExceptions: false,
  };

  let res = UrlFetchApp.fetch(url, options);
  
  return JSON.parse(res.getContentText());
  
}

/**
 * Get the details of a movie by ID
 *
 * @param {number} ID of the movie to get
 * @return {object} TMDB Movie result resource
 */
function getMovieDetails(movieID=62) {
  
  let apiKey = scriptProperties.getProperty('TmdbApiKey');
  
  let url = `${baseUrl}${version}/movie/${movieID}?api_key=${apiKey}&language=es_ES&append_to_response=credits`
  
  let options = {
    method: 'GET',
    muteHttpExceptions: false,
  };

  let res = UrlFetchApp.fetch(url, options);
    
  return JSON.parse(res.getContentText());
}

/**
 * Get the first ten cast members of a movie as a comma separated string
 *
 * @param {object} TMDB Movie result resource
 * @return {string} Comma separated string of the first ten cast members
 */
function getMovieCast(movieObject) {
  
  let i = 0;
  let ret = '';
  
  let cast = movieObject['credits']['cast']
  
  for(let elem in cast) {
    if(i < 9) {
      ret += `${cast[elem]['name']}, `;
    } else if(i == 9) {
      ret += cast[elem]['name'];
    } else {
      break;
    }
    i++;
  }
  
  return ret;
  
}

/**
 * Get the director of a movie
 *
 * @param {object} TMDB Movie result resource
 * @return {string} Name of the movie director
 */
function getMovieDirector(movieObject) { 
  let crew = movieObject['credits']['crew']
  
  for(let elem in crew) {
    if(crew[elem]['job'] === 'Director')
      return crew[elem]['name'];
  }  
}

