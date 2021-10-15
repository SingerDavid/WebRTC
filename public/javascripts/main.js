'use strict';

const $self = {
  rtcConfig: null,
  isPolite: false,
  isMakingOffer: false,
  isIgnoringOffer: false,
  isSettingRemoteAnswerPending: false,
  constraints: { audio: false, video: true }
};

const $peer = {
  connection: new RTCPeerConnection($self.rtcConfig)
};

/* Set up a stream by grabbing self and peer*/
requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  $self.stream = await navigator.mediaDevices.getUserMedia(constraints);
  displayStream('#self', $self.stream);
}

/* DOM media events (grab self and peer)*/

function displayStream( selector, stream ) {
  const video = document.querySelector(selector);
  video.srcObject = stream;
}

/* Socket Server Events and Callbacks*/

const namespace = autoGenerateNamespace(window.location.hash, true);

const sc = io(`/${namespace}`, { autoConnect: false});

registerScEvents();

/* Auto-generate namespace hash - Typed with minor adjustments - Code From Karl Stolley Lecture September 15th, 2021. ITMD369*/
function autoGenerateNamespace(hash, set_location) {
  let ns = hash.replace(/^#/, '');
  if(/^[0-9]{6}$/.test(ns)) {
    console.log("Test namespace", ns);
    return ns;
  } //end if
  ns = Math.random().toString().substring(2,8);
  console.log("Namespace created", ns);
  if (set_location) window.location.hash = ns;
  return ns;
}

/* DOM Events */

const button = document.querySelector('#connectButton');
document.querySelector('#roomID')
  .innerText = ('Room ID: #' + namespace);

button.addEventListener('click', handleButtonClass);

const chatform = document.querySelector('#chat-form');

chatform.addEventListener('submit', handleChatForm)

function handleButtonClass(e) {
  const buttonClass = e.target;
  if (buttonClass.className === 'join') {
    buttonClass.className = 'leave';
    buttonClass.innerText = "Leave Session";
    JoinSession();
  } else {
    buttonClass.className = 'join';
    buttonClass.innerText = "Join Session";
    LeaveSession();
  } //end else
} //end function handleButtonClass
 
function JoinSession() {
  sc.open();
  registerRtcEvents($peer);
  establishCallFeatures($peer);
  //button.innerHTML = "Leave Session";
  console.log("Joined Session, connecting to socket.io server...");
} //end Join

function LeaveSession() {
  displayStream('#peer', null);
  $peer.connection.close();
  $peer.connection = new RTCPeerConnection($self.rtcConfig);
  sc.close();
  // button.innerHTML = "Join Session";
  console.log("session left, disconnecting from socket.io server");
} // end Leave

function handleChatForm(e) {
  //Like a reset-css but telling the browser to not do what it normaly does.
  e.preventDefault();
  const input = document.querySelector('#chat-input');
  const message = input.value;
  input.value = '';
  appendMessage('self', message);
  $peer.chatChannel.send(message);
}


/* WebRTC Events */

function establishCallFeatures(peer) {
  peer.connection.addTrack($self.stream.getTracks()[0], $self.stream);
  peer.chatChannel = peer.connection.createDataChannel('chat', { negotiated: true, id: 20});
  peer.chatChannel.onmessage = function ({ data }) {
    appendMessage('peer', data);
  };
}

function registerRtcEvents(peer) {
  peer.connection.onnegotiationneeded = handleRtcNegotiation;
  peer.connection.onicecandidate = handleIceCandidate;
  peer.connection.ontrack = handleRtcTrack;
  peer.connection.ondatachannel = handleRtcDataChannel;
}

async function handleRtcNegotiation() {
  console.log("RTC negotionation needed...");
  // send an SDP description and set to make and close an offer
  $self.isMakingOffer = true;
  await $peer.connection.setLocalDescription();
  sc.emit('signal', { description: $peer.connection.localDescription});
  $self.isMakingOffer = false;
} //end negotionation

function handleIceCandidate({ candidate }) {
  sc.emit('signal', { candidate: candidate });
} //end candidate

function handleRtcTrack({ track, streams: [stream] }) {
  //attach incoming track to DOM
  displayStream('#peer', stream);
} // end track

function appendMessage(sender, message) {
    const logs = document.querySelector('#chat-log');
    const li = document.createElement('li');
    li.innerText = message;
    logs.appendChild(li);
} //end appendMessage


function handleRtcDataChannel({ channel }) {
  const dc = channel;
  console.log("Heard data channel event", dc.label, " with ID:", dc.id);
  $peer.testChannel = channel;
  console.log("Label:", $peer.testChannel.label);
  document.querySelector('#peer').className = dc.label;
  dc.onopen = function() {
    dc.close();
  };
}



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
  $self.isPolite = true;
} //end handleScConnectedPeer

async function handleScSignal({ description, candidate }) {
  console.log("--signaling event--");
  if (description) {
    console.log("Recieved SDP Signal:", description);

    //referenced from ITMD469 September 15, 2021 lecture. Karl Stolley.
    const readyForOffer = !$self.isMakingOffer &&
    ($peer.connection.signalingState === 'stable' || $self.isSettingRemoteAnswerPending);

    const offerCollision = description.type === 'offer' && !readyForOffer;

    $self.isIgnoringOffer = !$self.isPolite  && offerCollision;

    if ($self.isIgnoringOffer) {
      return;
    }

    $self.isSettingRemoteAnswerPending = description.type === 'answer';
    await $peer.connection.setRemoteDescription(description);
    $self.isSettingRemoteAnswerPending = false;

    if (description.type === 'offer') {
      await $peer.connection.setLocalDescription();
      sc.emit('signal', { description: $peer.connection.localDescription });
    } //end if

  } else if (candidate) {
    console.log("Recieved ICE candidate:", candidate);
    try {
      await $peer.connection.addIceCandidate(candidate);
    } //end of try. Used for older borwsers.
    catch(e) {
      if (!$self.isIgnoringOffer) {
        console.error("Cannot add ICE candidate to peer");
      }
    } //end of catch
  } //end of else if candidate
} // end handleScSignal

function handleScDisconnectedPeer() {
  console.log("peer disconnected");
  displayStream('#peer', null);
  $peer.connection.close();
  $peer.connection = new RTCPeerConnection($self.rtcConfig);
  //reconfigure - so disconnct can reconnect.
  registerRtcEvents($peer);
  establishCallFeatures($peer);
}//end handleScDisconnectedPeer
