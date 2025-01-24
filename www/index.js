const pagesCache = {};
let currentPage = '';
const pageLoadedEvent = new Event('pageLoadedEvent');

document.addEventListener('DOMContentLoaded', () => {
    loadPageToCache('home');
    loadPageToCache('saved_tilt_angles');
    navigateToPage('home');
});

// pages are loaded into cache
async function loadPageToCache(page) {
    try {
        pagesCache[page] = 'loading';

        const htmlUrl = `../pages/${page}.html`;

        // use fetch to get html content of page
        const response = await fetch(htmlUrl);

        if (!response.ok) {
            throw new Error('Fehler: ', response);
        }

        const content = await response.text();

        // import js script
        const jsUrl = `./${page}.js`;
        const pageModule = await import(jsUrl);

        pagesCache[page] = {
            html: content,
            js: pageModule,
        };
    } catch (err) {
        console.error('Fehler: ', err);
        pagesCache[page] = 'error';
    } finally {
        // tell listener that page has finished loading
        document.dispatchEvent(pageLoadedEvent);
    }
}

export function navigateToPage(page) {
    if (!(page in pagesCache)) {
        //Maybe load Page if not there? Not errow :c
        throw new Error(`Fehler: ${page} ist nicht im Cache enthalten.`);
    }

    if (pagesCache[page] == 'loading') {
        document.body.innerHTML = '<h1>Loading</h1>';

        document.addEventListener('pageLoadedEvent', () => {
            loadPage(page);
        });
    } else {
        loadPage(page);
    }
}

function loadPage(page) {
    document.body.innerHTML = pagesCache[page].html;
    currentPage = page;
    loadPageScript(page);
}

// load page-specific JS
function loadPageScript(page) {
    pagesCache[page].js.load();
}
