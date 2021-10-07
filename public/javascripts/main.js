'use strict';

const $self = {
  rtcConfig: null,
  constraints: { audio: false, video: true }
};

const $peer = {
  connection: new RTCPeerConnection($self.rtcConfig)
};

/* automatically makes video play. This sets up a stream between self */
requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  const video = document.getElementById('self');
  $self.stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = $self.stream;
}

/* Socket Server Events and Callbacks*/

const namespace = window.location.hash.substr(1);

const sc = io(`/${namespace}`, { autoConnect: false});

registerScEvents();
/* DOM Events */

  /* Only connect to socket once button Join Session is clicked */
const button = document.querySelector('#connectButton');

button.addEventListener('click', function() {
  sc.open();
  console.log("Join Session button was clicked, connecting to socket.io server...");
});

/* Signaling Channel Events */

function registerScEvents() {
  sc.on('connect', handleScConnect);
  sc.on('connected peer', handleScConnectedPeer);
  sc.on('signal', handleScSignal);
  sc.on('disconnected peer', handleScDisconnectedPeer);
} //end registerScEvents

function handleScConnect() {
  console.log("Connected to signaling channel, waiting on peer connect..");
} //end handleScConnect

function handleScConnectedPeer() {
  console.log("Heard a peer connect");
} //end handleScConnectedPeer

function handleScSignal() {
  console.log("Heard a signaling event");
} // end handleScSignal

async function handleScDisconnectedPeer() {
  console.log("Heard a peer disconnect");
}//end handleScDisconnectedPeer
