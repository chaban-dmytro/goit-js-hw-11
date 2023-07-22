import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const galleryItem = document.querySelector( '.gallery' );
const formEl = document.querySelector( '.search-form' );
const inputEl = document.querySelector( '.search-form input' );
const buttonEl = document.querySelector( '.search-form button' );
const loaderEl = document.querySelector( '.loader' );
const lightbox = new SimpleLightbox('.gallery a');

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

// more pages loader
const target = document.querySelector( '.js-guard' );
let options = {
  root: null,
  rootMargin: '400px',
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
        lightbox.refresh();
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
  if ( ( event.target.value.trim().length ) === 0 ) {
    Notiflix.Notify.warning('Your query must start with a LETTER or NUMBER and must not be EMPTY!');
    event.target.value = '';
    buttonEl.disabled = true;
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
      lightbox.refresh();
      observer.observe( target );
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
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
  return array.map( ( { largeImageURL, webformatURL, tags, likes, views, comments, downloads, } ) => `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      Likes
      <b>${likes}</b>
    </p>
    <p class="info-item">
      Views
      <b>${views}</b>
    </p>
    <p class="info-item">
      Comments
      <b>${comments}</b>
    </p>
    <p class="info-item">
      Downloads
      <b>${downloads}</b>
    </p>
    </div>
  </div>`).join( '' )
}