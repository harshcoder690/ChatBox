const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormSubmit = document.querySelector('button')

const messageTemplate = document.querySelector('#message-template').innerHTML
const $messages = document.querySelector('#messages')

const locationTemplate = document.querySelector('#location-template').innerHTML

const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

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

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    if (message.text != "") {
        console.log(message);
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)

    }
    autoscroll()
})
socket.on('locationMessage', (location) => {
    console.log(location);
    const html1 = Mustache.render(locationTemplate, {
        username: location.username,
        location1: location.url,
        created: moment(location.created).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html1)
    autoscroll()
})
socket.on('roomData', ({ room, users }) => {
    const html1 = Mustache.render(sidebarTemplate, {
        room: room.toUpperCase(),
        users
    })
    document.querySelector('#sidebar').innerHTML = html1
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormSubmit.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormSubmit.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
    })
})

$locationButton = document.querySelector('#send-location')

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported in this browser')
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        $locationButton.setAttribute('disabled', 'disabled')
        socket.emit('location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
})