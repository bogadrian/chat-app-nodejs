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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// autoscrool function to take user to the end of chat messages. it doesn't do that if manualy the scroll is brought up. only autmatic scrolling. it uses some specific DOM methods and it is not easy to understand what happens here. see documentation for getComputedStyle(), lastElementChild, offsetHeight, scrollHeight, scrollTop
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    // perform logic check to allow auto scroll only if scoll bar isn't brought up manually 
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
// enable the listener socket for message on client side
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text
    });
    $messages.insertAdjacentHTML('beforeend', html);
    //call autoscroll here
    autoscroll();
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
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    //call autoscroll here
    autoscroll();
});

//listen for the users list
socket.on('roomData', ({ users, room }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

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
        username: message.username,
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

