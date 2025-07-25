window.addEventListener('load', init);

let serverip = '192.168.0.110:4444'; // Change the server IP/port here
let autoConnect = true; // set this to true to automatically connect to obs without making a selection
let saveAndRestoreWatchDetails = true; // set this to true to save and automatically restore the state of what you were watching // combine with autoConnect = true for full experience
let deleteSavedSettings = false; // Set this to true, then reload the page to clear the saved data, then set to false again

let intervalID = 0;
let sceneRefreshInterval = 0;
let socketisOpen = false;
let studioMode = false;
let websocket = null;

let currentState = {
  watchedSource: '', // the source we are watching if any
  watchedScene_s: [], // the selected scene(s) we are monitoring
  previewScene: '', // the name of the current preview scene
  programScenes: [], // the name of the current live scenes. (can be 2 during transitions.)
  streaming: false, // are we currently streaming?
  sceneList: [], // a place to store the obs scene list
  watchingStreamStatus: false, //if the stream status is watched
};

function init() {
  // try to delete saved settings if user said so
  if (deleteSavedSettings) {
    localStorage.removeItem('connectionString');
    localStorage.removeItem('type');
    localStorage.removeItem('data');
  }

  // check if localStorage api is available
  if (typeof localStorage !== 'undefined') {
    serverip = localStorage.getItem('connectionString') || serverip;
  }
  document.getElementById('serverIP').value = serverip;

  // If autoconnect is enabled connect to server
  if (autoConnect) connectToServer();
}

function connectToServer() {
  enterFullscreen(document.documentElement);

  serverip = document.getElementById('serverIP').value;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('connectionString', serverip);
  }

  connectWebsocket();
}

function saveWatchSettings(type, data) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('type', type);
    localStorage.setItem('data', data);
  }
}

function restoreWatchSettings() {
  if (typeof localStorage !== 'undefined') {
    type = localStorage.getItem('type') || null;
    data = localStorage.getItem('data') || null;
    if (type === 'streamStatus') {
      watchStreamStatus();
    } else if (type === 'source') {
      watchSource(data);
    } else if (type === 'scene') {
      watchScene(data);
    }
    if (type) return true;
  }
  return false;
}

function connectWebsocket() {
  if (websocket) websocket.close();
  websocket = new WebSocket('ws://' + serverip);

  websocket.onopen = function (evt) {
    socketisOpen = 1;
    clearInterval(intervalID);
    intervalID = 0;
    requestInitialState();
  };

  websocket.onclose = function (evt) {
    socketisOpen = 0;
    if (!intervalID) {
      intervalID = setInterval(connectWebsocket, 5000);
    }
  };

  websocket.onmessage = function (evt) {
    let data = JSON.parse(evt.data);
    // console.log('onmessage', data);

    if (data.hasOwnProperty('message-id')) {
      handleInitialStateEvent(data);
    } else if (data.hasOwnProperty('update-type')) {
      handleStateChangeEvent(data);
    } else {
      console.log('onmessage unable to handle message.', data);
    }
  };

  websocket.onerror = function (evt) {
    socketisOpen = 0;
    if (!intervalID) {
      intervalID = setInterval(connectWebsocket, 5000);
    }
  };
}

function enterFullscreen(element) {
  //		if (element.requestFullscreen) {
  //			element.requestFullscreen();
  //		} else if (element.mozRequestFullScreen) {
  //			element.mozRequestFullScreen();
  //		} else if (element.msRequestFullscreen) {
  //			element.msRequestFullscreen();
  //		} else if (element.webkitRequestFullscreen) {
  //			element.webkitRequestFullscreen();
  //		}
}

// send messages to OBS requesting the initial state we need in order to function.   OJO AQUI, CLAVE
function requestInitialState() {
  // message-id: we make this up. used to identify response messages which are sent back from OBS.
  // request-type: command to send to OBS
  const commands = [
    {
      'message-id': 'get-scene-list',
      // https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getscenelist
      'request-type': 'GetSceneList',
    },
    {
      'message-id': 'get-studio-mode-status',
      // https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getstudiomodestatus
      'request-type': 'GetStudioModeStatus',
    },
    {
      'message-id': 'get-preview-scene',
      // https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md#getpreviewscene
      'request-type': 'GetPreviewScene',
    },
    {
      'message-id': 'get-streaming-status',
      'request-type': 'GetStreamingStatus',
    },
  ];

  for (let i = 0; i < commands.length; i++) {
    let payload = commands[i];

    // console.log('sending command', payload);
    if (socketisOpen) {
      websocket.send(JSON.stringify(payload));
    } else {
      console.error('unable to send command. socket not open.', payload);
    }
  }
}

//we are watching for a source contained in a scene  OJO AQUI, CLAVE
function watchSource(sourceName) {
  currentState.watchedSource = sourceName;
  currentState.watchedScene_s = [];
  currentState.sceneList.forEach((scene) => {
    let scenefilter = scene.sources.filter((sources) => {
      return sources.name == sourceName;
    });
    if (scenefilter.length > 0) {
      currentState.watchedScene_s.push(scene.name);
    }
  });
  //Update scene list containing this item every 30 sec in case someone adds the watched source to another scene
  if (!sceneRefreshInterval) {
    sceneRefreshInterval = setInterval(() => {
      if (socketisOpen) {
        websocket.send(
          JSON.stringify({
            'message-id': 'get-scene-list-update',
            'request-type': 'GetSceneList',
          })
        );
      }
    }, 30000);
  }
  watchScene(null, sourceName);
}

//we are watching one or more scenes
function watchScene(sceneName, sourceName = null) {
  // console.log("Selected:", sceneName, sourceName);
  if (sceneName) {
    currentState.watchedScene_s.push(sceneName);
    document.getElementById('selectedTitleText').innerHTML = sceneName;
    saveWatchSettings('scene', sceneName);
  } else if (sourceName) {
    document.getElementById('selectedTitleText').innerHTML = sourceName;
    saveWatchSettings('source', sourceName);
  }

  document.getElementById('selectedTitleBox').style.display = 'block';
  document.getElementById('selectionbox').style.display = 'none';
  document.getElementById('settingsbox').style.display = 'none';

  updateDisplay();
}

//we are watching for the stream status   OJO AQUI, CLAVE
function watchStreamStatus() {
  currentState.watchingStreamStatus = true;
  document.getElementById('selectionbox').style.display = 'none';
  document.getElementById('settingsbox').style.display = 'none';
  document.getElementById('wearelivebox').style.display = 'block';
  document.getElementById('wearelivetext').innerHTML = 'OFFLINE';

  updateDisplay();
  saveWatchSettings('streamStatus', '');
}

// process responses to requests sent by requestInitialState
function handleInitialStateEvent(data) {
  const messageId = data['message-id'];

  switch (messageId) {
    case 'get-scene-list':
      currentState.sceneList = data.scenes;
      currentState.programScenes = [data['current-scene']];
      if (saveAndRestoreWatchDetails && restoreWatchSettings()) {
        // Nothing because we already restored
      } else {
        generateSelectionBoxes(data['scenes']);
      }
      break;
    case 'get-studio-mode-status':
      studioMode = data['studio-mode'];
      break;
    case 'get-preview-scene':
      currentState.previewScene = data['name'];
      break;
    case 'get-streaming-status':
      currentState.streaming = data['streaming'];
      break;
    case 'get-scene-list-update':
      currentState.sceneList = data.scenes;
      watchSource(currentState.watchedSource);
      break;
    default:
      console.error('handleInitialStateEvent got unknown event.', data);
  }
}

// set currentState values based on incoming websocket messages
function handleStateChangeEvent(data) {
  // console.log("before update", currentState);
  // console.log(data);

  const updateType = data['update-type'];

  let displayNeedsUpdate = true;

  switch (updateType) {
    case 'PreviewSceneChanged':
      currentState.previewScene = data['scene-name'];
      break;
    case 'SwitchScenes':
      currentState.programScenes = [data['scene-name']];
      break;
    case 'StreamStarted':
      currentState.streaming = true;
      break;
    case 'StreamStopping':
      currentState.streaming = false;
      break;
    case 'TransitionBegin':
      currentState.programScenes = [data['to-scene'], data['from-scene']];
      break;
    default:
      displayNeedsUpdate = false;
  }

  // only do a display update if we received an event we care about.
  // OBS may send other events as well, which we will disregard.
  if (displayNeedsUpdate) {
    updateDisplay();
    // console.log("after update", currentState);
  }
}
// *************  AQUI SE MODIFICA EL ESTADO DEL DISPLAY LEIDO PREVIAMENTE DEL STATUS DE LA CAMARA EN OBS ***************
// update letious HTML elements based on current internal state letiables.
function updateDisplay() {
  if (
    currentState.watchedScene_s.some((r) =>
      currentState.programScenes.includes(r)
    )
  ) {
    color = 'red';
  } else if (currentState.watchingStreamStatus && currentState.streaming) {
    color = 'red';
  } else if (
    studioMode &&
    currentState.watchedScene_s.some((r) =>
      currentState.previewScene.includes(r)
    )
  ) {
    color = '#00ff00';
  } else if (currentState.watchingStreamStatus && !currentState.streaming) {
    color = 'white';
  } else {
    color = 'blue';
  }

  localStorage.setItem('tally_atril_color', color);

  document.body.style.backgroundColor = color;
  // textBackground = color == '#222' ? '#222' : 'transparent';
  // // document.getElementById('selectedTitleText').style.backgroundColor =
  // //   textBackground;
  // // *************  AQUI AGREGUE EL STATUS DE LA CAMARA EN OBS ***************
  // document.getElementById('NewColorStatus').style.backgroundColor = color;
  // *************  AQUI AGREGUE EL STATUS DE LA CAMARA EN OBS ***************

  // streamDescription = currentState.streaming ? 'LIVE' : 'OFFLINE';
  // document.getElementById('wearelivetext').innerHTML = streamDescription;
}

// En realidad no necesito esto, solo la modificación del color del background en el panel de control de camaras
// build buttons which allow user to select which scene to watch
function generateSelectionBoxes(list) {
  let div = document.getElementById('selectionbox');

  let scenesText = document.createElement('div');
  scenesText.appendChild(document.createTextNode('Escenas:'));
  let sourcesText = document.createElement('div');
  sourcesText.appendChild(document.createTextNode('Fuentes:'));

  let b = document.createElement('button');
  b.appendChild(document.createTextNode('Stream Status'));
  b.addEventListener('click', watchStreamStatus);
  div.appendChild(b);

  div.appendChild(scenesText);
  list.forEach((scene) => {
    b = document.createElement('button');
    b.appendChild(document.createTextNode(scene.name));
    b.addEventListener('click', () => {
      watchScene(scene.name);
    });
    div.appendChild(b);
  });

  let sourcelist = [];
  div.appendChild(sourcesText);
  list.forEach((scene) => {
    scene.sources.forEach((source) => {
      if (!sourcelist.includes(source.name)) {
        sourcelist.push(source.name);
        b = document.createElement('button');
        b.appendChild(document.createTextNode(source.name));
        b.addEventListener('click', () => {
          watchSource(source.name);
        });
        div.appendChild(b);
      }
    });
  });
}
