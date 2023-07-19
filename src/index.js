import axios from "axios";
import Notiflix from 'notiflix';

const galleryItem = document.querySelector( '.gallery' );
const formEl = document.querySelector( '.search-form' );
const inputEl = document.querySelector( '.search-form input' );
const buttonEl = document.querySelector( '.search-form button' );
const loaderEl = document.querySelector( '.loader' );

const BASE_URL = 'https://pixabay.com/api';
let userInfo;
let totalHits;
let totalPages;
const imagesOnPage = 40;
let currentPage = 1;

inputEl.addEventListener( 'input', checkInput );
formEl.addEventListener( 'submit', formSubmit );
buttonEl.disabled = true;
loaderEl.hidden = true;

const target = document.querySelector( '.js-guard' );
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};
let observer = new IntersectionObserver( onLoad, options );

function onLoad( entries, observer ) {
  entries.forEach( entry => {
    if ( entry.isIntersecting ) {
      currentPage += 1;
      getImages( currentPage )
      .then( resp => {
      const array = resp.data.hits;
      galleryItem.insertAdjacentHTML( 'beforeend', createMarkup( array ) );
        if ( currentPage === totalPages ) {
          observer.unobserve( target );
        }
      }
    )
    .catch( err => {
      Notiflix.Notify.failure( 'Oops! Something went wrong! Try reloading the page!' );
      loaderEl.hidden = true;
      });
    }
  })
}

function checkInput( event ) {
  if ( (event.target.value.trim().length) === 0 ) {
    Notiflix.Notify.warning('Your query must start with a LETTER or NUMBER and must not be EMPTY!');
    event.target.value = '';
    return;
  }
  buttonEl.disabled = false;
  userInfo = event.target.value.trim();
}

function formSubmit( event ) {
  event.preventDefault();
  loaderEl.hidden = false;
  inputEl.value = '';
  galleryItem.innerHTML = '';
  buttonEl.disabled = true;
  getImages()
    .then( resp => {
      totalHits = resp.data.totalHits;
      totalPages = Math.ceil( totalHits / imagesOnPage );
      const array = resp.data.hits;
      loaderEl.hidden = true;
    if ( array.length === 0 ) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
    } else {
      galleryItem.insertAdjacentHTML( 'beforeend', createMarkup( array ) );
      observer.observe( target );
    }
  } )
  .catch( err => {
    Notiflix.Notify.failure( 'Oops! Something went wrong! Try reloading the page!' );
    loaderEl.hidden = true;
    }
  );
}

async function getImages( page = 1 ) {
  return await axios.get( `${BASE_URL}/?&page=${page}&q=${userInfo}`, {
    params: {
      key: '38307490-77491a55abe31d7c70378f259',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: imagesOnPage,
    }
  })
}

function createMarkup( array ) {
  console.log( array );
  return array.map( ( { largeImageURL, webformatURL, tags, likes, views, comments, downloads, } ) => `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b>${downloads}</b>
    </p>
    </div>
  </div>`).join( '' )
}










// function takeImages() {
//   return fetch(
//     `${BASE_URL}/?q=${userInfo}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PAGES_ON_PAGE}&page=${currentPage}&key=${API_KEY}`
//   ).then( resp => {
//     if ( !resp.ok ) {
//       throw new Error(resp.statusText)
//     }  
//     return resp.json()
//   } )
// }

// takeImages().then( data => {
//   console.log( data );
  
// } ).catch( err => {
//   // Notiflix.Notify.failure( 'Oops! Something went wrong! Try reloading the page!' );
//   // selectInputEl.innerHTML = `<option value='noInfo'>No info from server</option>`
//   // loaderEl.classList.add( 'hidden' );
//   console.log("ERROR");
// }
// );
