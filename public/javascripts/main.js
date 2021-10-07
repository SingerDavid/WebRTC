'use strict';

const $self = {
  constraints: { audio: false, video: true }
};

requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  const video = document.getElementById('self');
  $self.stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = $self.stream;
}

/*
'use strict';

/* Now we have to ask the browser to request for video/user media
const $self = {
  constraints: { audio: false, video: true }
};

/* automatically makes video play. This sets up a stream between self
requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  const video = document.querySelector('#self');
  $self.stream = await navigator.mediaDevices
    .getUserMedia(constraints);
  video.srcObject = $self.stream;
}
*/
