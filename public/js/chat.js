// call the socket function client side
const socket = io();


//DOM elements
const $form = document.querySelector('#form');
const $fieldInput = form.querySelector('input');
const $buttonForm = form.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
//const $locationMessage = document.querySelector('#location');


//using Qs library to get the query string as an object
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
console.log(room)

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;


// enable the listener socket for message on client side
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
});

// add event listener on form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // get the input value and emit it to the server, wait for the callback of aknowledgment 
    const message = e.target.elements.message.value;

    // disable form after the first submit
    $buttonForm.setAttribute('disabled', 'disabled')

    socket.emit('chatUser', message, (error) => {
        //renable form submit aftre message 
        $buttonForm.removeAttribute('disabled');
        $fieldInput.value = '';
        $fieldInput.focus();
        if (error) {
            return console.log(error)
        }
        console.log(message)
    })


});

//listen for the single every single message 
socket.on('singleMessage', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
});

// enable location sharing with geolocation 
$sendLocationButton.addEventListener('click', () => {
    //check if the geolocation is allowed
    if (!navigator.geolocation) {
        return alert('Your device does not support geolocation or it is not enabled!')
    };

    $sendLocationButton.setAttribute('disabled', 'disabled');

    // emit to the server the current user location and wait for the callback of aknolwedgnment 
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            createdAt: new Date().getTime()
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared');
        });
    });

});

// listen for others users location sharing 
socket.on('userLocation', (message) => {
    console.log(message.url)
    //render link to enable open location 
    const html = Mustache.render(locationTemplate, {
        message: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }

});

