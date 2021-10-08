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

const namespace = autoGenerateNamespace(window.location.hash, true);

const sc = io(`/${namespace}`, { autoConnect: false});

registerScEvents();

/* Auto-generate namespace hash - Typed with minor adjustments - Code From Karl Stolley Lecture September 15th, 2021. ITMD369*/
function autoGenerateNamespace(hash, set_location) {
  let ns = hash.replace(/^#/, '');
  if(/^[0,9]{6}$/.test(ns)){
    console.log("Test namespace", ns);
    return ns;
  } //end if
  ns = Math.random().toString().substring(2,8);
  console.log("Namespace created", ns);
  if (set_location) window.location.hash = ns;
  return ns;
}


/* DOM Events */

  /* Only connect to socket once button Join Session is clicked */
const button = document.querySelector('#connectButton');

button.addEventListener('click', JoinSession);

function JoinSession() {
  sc.open();
  //button.innerHTML = "Leave Session";
  console.log("Joined Session, connecting to socket.io server...");
} //end Join

function LeaveSession() {
  sc.close();
  // button.innerHTML = "Join Session";
  console.log("session left, disconnecting from socket.io server");
} // end Leave

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
  console.log("peer connected");
} //end handleScConnectedPeer

function handleScSignal() {
  console.log("--signaling event--");
} // end handleScSignal

async function handleScDisconnectedPeer() {
  console.log("peer disconnected");
}//end handleScDisconnectedPeer
