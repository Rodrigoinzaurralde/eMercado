const loadings = document.querySelectorAll('.loading');

function renderCard() {

    for (loading of loadings) {
        loading.classList.remove('loading');
    }
}

window.onload = () => {
    renderCard();
}