const CACHE_NAME = 'videoacessivel-cache-v1';
const urlsToCache = [
    './',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    // Adicione URLs dos seus ícones aqui
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
];

// Instalação: Abre o cache e armazena todos os arquivos necessários
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Busca: Intercepta requisições e serve do cache se disponível
self.addEventListener('fetch', event => {
    // Tenta obter do cache, se falhar, vai para a rede.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});