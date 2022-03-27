let db; 

const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_bankTransaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      uploadBankTransaction()  
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};


// function to be executed if an attempt is made to submit a new transaction without an internet connection 
function saveRecord(record) {
    const transaction = db.transaction(['new_bankTransaction'], 'readwrite');
    
    const bankTransactionObjectStore = transaction.objectStore('new_bankTransaction');
    
    bankTransactionObjectStore.add(record);
}

function uploadBankTransaction() {
    const transaction = db.transaction(['new_bankTransaction'], 'readwrite');

    const bankTransactionObjectStore = transaction.objectStore('new_bankTransaction');

    const getAll = bankTransactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result), 
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_bankTransaction'], 'readwrite');
                
                const bankTransactionObjectStore = transaction.objectStore('new_bankTransaction');

                bankTransactionObjectStore.clear();

                alert('All saved transactions have been submitted.')
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

window.addEventListener('online', uploadBankTransaction);