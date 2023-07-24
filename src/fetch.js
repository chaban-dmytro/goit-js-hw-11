import axios from "axios";

const BASE_URL = 'https://pixabay.com/api';
export const imagesOnPage = 40;

export async function getImages( currentPage, userInfo ) {
  return await axios.get( `${BASE_URL}/?&page=${currentPage}&q=${userInfo}`, {
    params: {
      key: '38307490-77491a55abe31d7c70378f259',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: imagesOnPage,
    }
  })
}