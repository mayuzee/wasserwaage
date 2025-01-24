// online/offline detection
export function load() {
    const network_status_element = document.getElementById('network-status');
    let networkStatus;
    detectNetworkStatus();

    window.addEventListener('offline', (event) => {
        detectNetworkStatus();
    });

    window.addEventListener('online', (event) => {
        detectNetworkStatus();
    });

    function detectNetworkStatus() {
        networkStatus = navigator.onLine;
        if (networkStatus) {
            network_status_element.innerText = 'online';
            network_status_element.style.backgroundColor = '#70dd85';
        } else {
            network_status_element.innerText = 'offline';
            network_status_element.style.backgroundColor = '#d9971c';
        }
    }
}
