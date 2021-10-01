'use strict';

/* Now we have to ask the browser to request for video/user media */
const $self = {
  constraints: { audio: false, video: true }
};

/* automatically makes video play */
requestUserMedia($self.constraints);

async function requestUserMedia(constraints) {
  $self.stream = await navigator.mediaDevices
  .getUserMedia(constraints);
}
