'use strict';

/* Now we have to ask the browser to request for video/user media */
const $self = {
  constraints: { audio: false, video: true }
};

const $peer = {
  connection: new RTCPeerConnection()
};

/* automatically makes video play. This sets up a stream between self */
requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  const video = document.querySelector('#self');
  $self.stream = await navigator.mediaDevices
    .getUserMedia(constraints);
  video.srcObject = $self.stream;
}

/* Socket Server Events and Callbacks*/

const namespace = window.location.hash.substr(1);

const sc = io(`/${namespace}`, { autoConnect: false});

  /* Only connect to socket once button Join Session is clicked */
const button = document.querySelector('#connectButton');

button.addEventListener('click', function() {
  sc.open();
  console.log("Join Session button was clicked, connecting to socket.io server...");
});

sc.on('connect', function() {
  console.log("Connected to socket.io instance");
});

sc.on('connected peer', function() {
  console.log('Hear a peer connect')
});
