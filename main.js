const socket = io();

// DOM elements
const clientTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone=new Audio('message-tone.mp3')
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});


socket.on('clients-total', (data) => {
    clientTotal.innerText = `Total Clients: ${data}`;
});

// Function to send messages
function sendMessage() {
    if (!messageInput.value.trim()) return;
    
    const data = {
        name: nameInput.value ,
        message: messageInput.value,
        dateTime: new Date()
    };
    
    socket.emit('message', data);
    addMessageToUI(true,data); // Show message immediately for sender
    messageInput.value = ''; // Clear input field
}
socket.on('chat-message',(data) => {
    messageTone.play()
    addMessageToUI(false,data)
})
function addMessageToUI(isOwnMessage, data) {
    clearFeedback();

    // Handle line breaks and escape basic HTML
    const safeMessage = data.message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${safeMessage}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>`;

    messageContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0,messageContainer.scrollHeight);
}
messageInput.addEventListener('focus',(e)=>{
    socket.emit('feedback',{
        feedback: `${nameInput.value} is typing a message`,
    })

})
messageInput.addEventListener('blur',() => {
    socket.emit('feedback', {
      feedback: '',
    })
  })
socket.on('feedback',(data)=>{
    clearFeedback()
    const element=`
      <li class="message-feedback">
                <p class="feedback" id="feedback">${data.feedback}</p>
            </li>`
            messageContainer.innerHTML +=element;



})
function clearFeedback(){
    document.querySelectorAll(`li.message-feedback`).forEach(element =>{
        element.parentNode.removeChild(element);
    })
}
