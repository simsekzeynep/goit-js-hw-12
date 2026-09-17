import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import { fetchImages } from "./js/pixabay-api.js";
import { renderGallery, clearGallery } from "./js/render-functions.js";

const form = document.querySelector(".search-form");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");
const loader = document.querySelector(".loader");

let query = "";
let page = 1;
const perPage = 40;
let totalHits = 0;

form.addEventListener("submit", onSearch);
loadMoreBtn.addEventListener("click", onLoadMore);

async function onSearch(event) {
  event.preventDefault();

  query = event.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({
      title: "Caution",
      message: "Please enter a search query!",
      position: "topRight",
    });
    return;
  }

  page = 1;
  clearGallery(gallery);
  hideLoadMore();
  showLoader();

  try {
    const data = await fetchImages(query, page, perPage);
    totalHits = data.totalHits;

    if (!data.hits || data.hits.length === 0) {
      iziToast.error({
        message:
          "Sorry, there are no images matching your search query. Please try again!",
        position: "topRight",
      });
      return;
    }

    renderGallery(data.hits, gallery);

    if (totalHits > perPage) {
      showLoadMore();
    } else {
      showEndMessage();
    }
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Something went wrong. Please try again later!",
      position: "topRight",
    });
  } finally {
    hideLoader();
    form.reset();
  }
}

async function onLoadMore() {
  const nextPage = page + 1;
  hideLoadMore();
  showLoader();

  try {
    const data = await fetchImages(query, nextPage, perPage);
    page = nextPage;
    renderGallery(data.hits, gallery);

    // Yumuşak kaydırma
    smoothScroll();

    const loadedImages = page * perPage;
    if (loadedImages >= totalHits) {
      hideLoadMore();
      showEndMessage();
    } else {
      showLoadMore();
    }
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Failed to load more images!",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }
}

function showLoader() {
  if (loader) loader.classList.remove("is-hidden");
}

function hideLoader() {
  if (loader) loader.classList.add("is-hidden");
}

function showLoadMore() {
  if (loadMoreBtn) loadMoreBtn.classList.remove("is-hidden");
}

function hideLoadMore() {
  if (loadMoreBtn) loadMoreBtn.classList.add("is-hidden");
}

function showEndMessage() {
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: "topRight",
  });
}

function smoothScroll() {
  const firstCard = gallery.firstElementChild;
  if (firstCard) {
    const cardHeight = firstCard.getBoundingClientRect().height;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });
  }
}
