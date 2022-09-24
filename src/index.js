import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

class ImgApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1
     }
    
    async fetchIMG() {
        const axios = require('axios').default;
        axios.defaults.baseURL = 'https://pixabay.com/api';
        const API_KEY = '30141865-2e1e855e4999a5f5315f55850';
        const option = 'image_type=photo&orientation=horizontal&safesearch=true'
        try {
            const response = await axios.get(`/?key=${API_KEY}&${option}&q=${this.searchQuery}&page=${this.page}&per_page=40`)
            this.page += 1
            
            return response
        } catch(error) {
            console.log(error)
        }
    }

    get query() {
        return this.searchQuery;
    }

    set query(newSearchQuery) {
        this.searchQuery = newSearchQuery;
    }

     get getpage() {
        return this.page;
    }
    set getpage(newPage) {
       this.page = newPage;
    }
}
const imgApiService = new ImgApiService()

const refs = {
  form: document.querySelector(".js-search-form"),
  gallery: document.querySelector(".js-gallery"),
};

refs.form.addEventListener("submit", onSearch)

async function onSearch(e) {
  e.preventDefault()
  

     if (e.currentTarget.elements.searchQuery.value == '') {
        Notify.info('Come on, type something :)')
        return
    }

    imgApiService.searchQuery = e.target.elements.searchQuery.value

  
    const response = await imgApiService.fetchIMG()
    const searchResults = response.data.hits
       
    if (searchResults.length == 0) {
        Notify.failure("Sorry, there are no images matching your search query. Please try again.")
        return
    }
    Notify.success(`Hooray! We found ${response.data.totalHits} images.`)
    window.scrollTo(0,0)
    refs.gallery.innerHTML = ''
    renderGallery(searchResults) 
}


async function renderGallery(searchResults) {
  let temp = await searchResults
    .map((img) => 
    `<a href="${img.largeImageURL}" class="gallery__link"><div class="photo-card">
      <img class='image' src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes: ${img.likes}</b>
        </p>
        <p class="info-item">
          <b>Views: ${img.views}</b>
        </p>
        <p class="info-item">
          <b>Comments: ${img.comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads: ${img.downloads}</b>
        </p>
      </div>
    </div></a>`
    ).join('')
    refs.gallery.insertAdjacentHTML('beforeend', temp)
    gallery.refresh()
    
}

let gallery = new SimpleLightbox('.gallery a', {
    captionsData: "alt",
    captionDelay: 350,  
});  


window.addEventListener('scroll', throttle(loadMoreOnScroll, 400))
window.addEventListener('resize', throttle(loadMoreOnScroll, 400))

async function loadMoreOnScroll() {
    if (refs.gallery.innerHTML === '') return
    const height = document.body.offsetHeight
    const screenHeight = window.innerHeight
    const scrolled = window.scrollY
    const threshold = height - screenHeight / 4
    const position = scrolled + screenHeight

    if (position >= threshold) {
        const response = await imgApiService.fetchIMG()

        if (Math.sign(response.data.totalHits - 40 * (imgApiService.getpage - 1)) == -1) {
            Notify.failure("We're sorry, but you've reached the end of search results.")
            return 
        }
        const searchResults = response.data.hits
        renderGallery(searchResults)
    }
}

function throttle(callee, timeout) {
  let timer = null

  return function perform(...args) {
    if (timer) return

    timer = setTimeout(() => {
      callee(...args)

      clearTimeout(timer)
      timer = null
    }, timeout)
  }
}