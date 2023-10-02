const player = document.getElementById('player');
const videElem = player.querySelector('video');

const playerControlsElem = player.querySelector('.controls');

const playButton = document.getElementById('playButton');

const elapseBar = document.getElementById('elapseBar');
const bgBar = document.getElementById('bgBar');

const timeStatElem = document.getElementById('timeStat');
const elpasedTimeElem = timeStatElem.querySelectorAll('span')[0];
const totalTimeElem = timeStatElem.querySelectorAll('span')[2];

const pauseScreenElem = document.getElementById("pauseScreen");

const fullScreenButton = document.getElementById("fullScreenButton");

const pipButton = document.getElementById('pipButton');

const volumeButtonElem = document.getElementById('volumeButton');

const SPRITE_IMG_WIDTH = 190;
const SPRITE_IMG_HEIGHT = 80;


const toolTipElem = document.createElement('span');
toolTipElem.style.position = "absolute";

let videoEndTime = 0;
let elapsedTime = 0
let seekInterval;
let isVideoEnded = false;
let animationRequest;
let lastAnimatedTime;
let isFullScreen = false;
let isInPip = false;
let lastMouseMoveTime;
let mouseMoveTrackerTimeout;
let lastVolumeLevel;
let isMuted = 0;
let seekPreviewCanvas = createSeekPreviewCanvas();
let previewImage = createPreviewImageElem();

function createSeekPreviewCanvas() {
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = SPRITE_IMG_WIDTH;
    previewCanvas.height = SPRITE_IMG_HEIGHT;
    return previewCanvas;
}

function createPreviewImageElem() {
    const imageNode = document.createElement('img');
    imageNode.id = "previewImg";
    imageNode.style.userSelect = "none";
    imageNode.style.width = 200 + "px";
    imageNode.style.height = 120 + "px";
    imageNode.style.position = "absolute";
    imageNode.style.bottom = "50px";
    imageNode.style.objectFit = "cover"
    return imageNode;
}

videElem.focus();

let isVideoPlaying = false;

videElem.addEventListener('onload', (e) => {
    videoEndTime = videElem.duration;
    totalTimeElem.innerText = getFormattedTimeString(videoEndTime);
});

videElem.addEventListener('canplay', (e) => {
    videoEndTime = videElem.duration;
    elpasedTimeElem.innerText = "00:00"
    totalTimeElem.innerText = getFormattedTimeString(videoEndTime);;
    lastVolumeLevel = videElem.volume;
    isMuted = lastVolumeLevel > 0;
});

//control autohide/show 

player.addEventListener('mouseleave', () => {
    console.log('lfef');
    if (isVideoPlaying) {
        setTimeout(() => {
            playerControlsElem.classList.add('hide-elem')
        }, 500000);
    }
});

player.addEventListener('mouseenter', () => {
    playerControlsElem.classList.remove('hide-elem');
    playerControlsElem.classList.add('show-elem');
});



// video play pause controls

document.addEventListener('keyup', (e) => {
    if (e.code === "Space") {
        handlePlayPause();
    }
});

playButton.addEventListener('click', handlePlayPause);

player.querySelector('video').addEventListener('click', handlePlayPause);

pauseScreenElem.addEventListener('click', handlePlayPause);

pauseScreenElem.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation();
    handlePlayPause(e)
});

function handlePlayPause(e) {
    clearInterval(seekInterval);
    cancelAnimationFrame(animationRequest);
    lastAnimatedTime = undefined;
    if (isVideoPlaying) {
        videElem.pause();
        playButton.querySelector('img').src = "./icons/play-svgrepo-com.svg";
        addPauseScreen();
    } else {
        playButton.querySelector('img').src = "./icons/pause-svgrepo-com.svg";
        videElem.play();
        handlePlaytimeAttrs();
        removePauseScreen();
    }
    isVideoPlaying = !isVideoPlaying;
};

function addPauseScreen() {
    player.appendChild(pauseScreenElem)
}

function removePauseScreen() {
    if (player.querySelector("div[id='pauseScreen']")) {
        player.removeChild(pauseScreenElem);
    }
}

function handlePlaytimeAttrs() {
    clearInterval(seekInterval);
    updateVideoTime();
    updateTimeBar();
}

function updateTimeBar() {
    if (!lastAnimatedTime) lastAnimatedTime = videElem.currentTime;
    const currentVideoTime = videElem.currentTime;
    const currentWidth = elapseBar.getBoundingClientRect().width;
    const newWidth = currentWidth + (currentVideoTime - lastAnimatedTime) * bgBar.getBoundingClientRect().width / videElem.duration;
    elapseBar.style.width = newWidth + "px";
    animationRequest = requestAnimationFrame(() => {
        updateTimeBar();
    });
    lastAnimatedTime = currentVideoTime;
}

function updateVideoTime() {
    clearInterval(seekInterval);
    seekInterval = setInterval(() => {
        elapsedTime += 1;
        elpasedTimeElem.innerText = getFormattedTimeString(elapsedTime)
    }, 1000);
}


videElem.addEventListener('ended', (e) => {
    clearInterval(seekInterval);
    cancelAnimationFrame(animationRequest);
    isVideoPlaying = false;
    isVideoEnded = true;
    lastAnimatedTime = 0;
    playButton.querySelector('img').src = "./icons/replay-svgrepo-com.svg";
    elapseBar.style.width = "0px";
});

player.addEventListener('mousemove', () => {
    playerControlsElem.classList.remove('hide-elem');
    playerControlsElem.classList.add('show-elem');

    clearTimeout(mouseMoveTrackerTimeout);
    mouseMoveTrackerTimeout = setTimeout(() => {
        hideControlPanel();
    }, 4000);
});

player.addEventListener('mouseup', () => {
    setTimeout(hideControlPanel, 3000);
});

player.addEventListener('mouseleave', () => {

    clearTimeout(mouseMoveTrackerTimeout);
    mouseMoveTrackerTimeout = setTimeout(() => {
        hideControlPanel();
    }, 4000);
});

function showControlPanel() {
    playerControlsElem.classList.remove('hide-elem');
    playerControlsElem.classList.add('show-elem');
}

function hideControlPanel() {
    volumeButtonElem.querySelector('input').classList.remove('hide-elem');
    volumeButtonElem.querySelector('input').classList.add('show-elem');
}

// seek controls

elapseBar.addEventListener('click', handleSeek);

bgBar.addEventListener('click', handleSeek);

document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") {
        handleFixedSeek(5, 1);
    } else if (e.key === "ArrowLeft") {
        handleFixedSeek(5, -1);
    }
});

function handleFixedSeek(amount, direction) {
    const videMoveSecond = amount * direction;
    elapsedTime = Math.min(elapsedTime + videMoveSecond, videoEndTime);
    videElem.currentTime += videMoveSecond;
    const newTimeBarWidth = elapseBar.getBoundingClientRect().width + videMoveSecond * bgBar.getBoundingClientRect().width / videElem.duration;
    requestAnimationFrame(() => {
        elapseBar.style.width = Math.min(bgBar.getBoundingClientRect().width, newTimeBarWidth) + "px";
        elpasedTimeElem.innerText = getFormattedTimeString(elapsedTime);
    });
}

function handleSeek(seekEvt) {
    const clickedPoint = seekEvt.offsetX; // offsetX gives offset from the start of element's padding box

    const videoTimeForClick = (videoEndTime / bgBar.getBoundingClientRect().width) * clickedPoint;
    videElem.currentTime = Math.round(videoTimeForClick);
    elapsedTime = Math.round(videoTimeForClick);
    requestAnimationFrame(() => {
        elapseBar.style.width = clickedPoint + "px";
        elpasedTimeElem.innerText = getFormattedTimeString(elapsedTime);
    })
}

function getFormattedTimeString(timeInSecs) {
    if (timeInSecs < 60) {
        return `00:${getCorrectNumericTimeText(timeInSecs)}`;
    }
    else if (timeInSecs < 3600) {
        const mins = Math.floor(timeInSecs / 60);
        const secs = timeInSecs - mins * 60;
        return `${getCorrectNumericTimeText(mins)}:${getCorrectNumericTimeText(secs)}`
    } else {
        const hour = Math.floor(timeInSecs / 3600);
        timeInSecs -= hour * 3600;
        const mins = Math.floor(timeInSecs / 60);
        const secs = Math.round(timeInSecs - mins * 60);
        return `${getCorrectNumericTimeText(hour)}:${getCorrectNumericTimeText(mins)}:${getCorrectNumericTimeText(secs)}`;
    }
}

function getCorrectNumericTimeText(time) {
    return time < 10 ? "0" + Math.round(time) : Math.round(time);
}

// hover controls/interactions
[bgBar, elapseBar].forEach((bar) => {
    bar.addEventListener('mouseover', (e) => {
        addSeekPreview(e.offsetX);
        addToolTip(e);
    });

    bar.addEventListener('mousemove', (e) => {
        addToolTip(e);
        addSeekPreview(e.offsetX);
    });

    bar.addEventListener('mouseleave', () => {
        bgBar.removeChild(toolTipElem);
        if (bgBar.querySelector("img[id='previewImg']")) {
            bgBar.removeChild(previewImage);
        }
    });
})


isDragStarted = false;
// seek drag controls
[elapseBar, bgBar].forEach((bar) => {
    bar.addEventListener('mousedown', (e) => {
        isDragStarted = true;
    });

    bar.addEventListener('mouseup', () => {
        isDragStarted = false;
    })
});

document.addEventListener('mouseup', (e) => {
    isDragStarted = false;
});

document.addEventListener('mousemove', (e) => {
    const maxWidth = bgBar.getBoundingClientRect().width;
    if (isDragStarted) {
        requestAnimationFrame(() => {
            const currentElapseWidth = Math.min(maxWidth, e.pageX);
            elapseBar.style.width = currentElapseWidth + "px";
            elapsedTime = Math.round(videoEndTime * currentElapseWidth / maxWidth );
            videElem.currentTime = elapsedTime;
            elpasedTimeElem.innerText = getFormattedTimeString(elapsedTime);
        })
    }
})

function addToolTip(evt) {
    const pointX = evt.offsetX;
    const time = videoEndTime * pointX / bgBar.getBoundingClientRect().width;
    toolTipElem.innerText = getFormattedTimeString(time);
    toolTipElem.style.color = "white";
    toolTipElem.style.left = pointX - 20 + "px";
    toolTipElem.style.zIndex = 100;
    toolTipElem.style.bottom = 20 + "px";
    bgBar.appendChild(toolTipElem);
}

function addSeekPreview(leftPos) {
    const previewSprite = new Image();
    previewSprite.onload = () => handleLoadedSpriteImage(previewSprite, leftPos);
    previewSprite.src = "http://localhost:4000/thumb";
}

function handleLoadedSpriteImage(previewSprite, hoveredPosition) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // draw the sprite image on canvas to extract frames
    canvas.width = previewSprite.width;
    canvas.height = previewSprite.height;
    ctx.drawImage(previewSprite, 0, 0, previewSprite.width, previewSprite.height);

    //get the row column for extraction
    const { row, column } = findRowColumnForSpriteFrameExtraction(hoveredPosition);
    const imageXInSprite = SPRITE_IMG_WIDTH * (column);
    const imageYInSprite = SPRITE_IMG_HEIGHT * (row);
    var ImageData = ctx.getImageData(imageXInSprite, imageYInSprite, 190, 80);
    seekPreviewCanvas.getContext('2d').putImageData(ImageData, 0, 0);
    const url = seekPreviewCanvas.toDataURL();
    if (bgBar.querySelector('img')) {
        bgBar.removeChild(bgBar.querySelector('img'));
    }
    previewImage.src = url;
    previewImage.style.left = determineLeftPosorPreviewImage(hoveredPosition) + "px";
    bgBar.appendChild(previewImage);
}

function findRowColumnForSpriteFrameExtraction(hoveredPosition) {
    const timeForPreview = Math.round(hoveredPosition * videoEndTime / bgBar.getBoundingClientRect().width);
    const row = Math.floor(timeForPreview / 10) // in each row of the sprite we will have frames for 10 secs
    const column = Math.floor((timeForPreview - row * 10) / 2);

    return {
        row, column
    }
}

function determineLeftPosorPreviewImage(leftPos) {
    const actualPos = leftPos - SPRITE_IMG_WIDTH / 2;
    const maxPos = bgBar.getBoundingClientRect().width - SPRITE_IMG_WIDTH;
    const minPos = 0;
    if (actualPos < minPos) return minPos;
    else if (actualPos > maxPos) return maxPos;
    return actualPos;
}

// full screen controls
fullScreenButton.addEventListener('click', () => {
    player.requestFullscreen().then((res) => {
        isFullScreen = true;
    })
});

player.addEventListener('fullscreenchange', (e) => {
    isFullScreen = !isFullScreen;
});

document.addEventListener('keyup', (e) => {
    if (isFullScreen === undefined) return;
    if (e.key === "f") {
        if (isFullScreen) {
            player.requestFullscreen().then(() => {
                isFullScreen = true;
            });
        } else {
            document.exitFullscreen().then(() => {
                isFullScreen = false;
            });
        }
    }
})

//picture in picture controls
pipButton.addEventListener('click', controlPIP);

function controlPIP(evt) {
    if (isInPip && document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }
    videElem.requestPictureInPicture();
    isInPip = true;
}

videElem.onleavepictureinpicture = function (e) {
    handlePlayPause(e)
}

// volume controls

volumeButtonElem.addEventListener('click', () => {
    const volumeRangeElem = volumeButtonElem.querySelector('input');
    if (videElem.volume === 0) {
        videElem.volume = lastVolumeLevel;
        console.log(lastVolumeLevel);
        volumeRangeElem.value = lastVolumeLevel * 100;
        volumeButtonElem.querySelector('img').src = "./icons/volume-max-svgrepo-com.svg";
    } else {
        volumeButtonElem.querySelector('img').src = "./icons/mute-svgrepo-com.svg";
        videElem.volume = 0;
        volumeRangeElem.value = 0;
    }
})

volumeButtonElem.querySelector('input').addEventListener('click', (e) => {
    e.stopPropagation();
    videElem.volume = e.target.value / 100;
    lastVolumeLevel = videElem.volume;
    if (e.target.value > 0) {
        isMuted = false;
        volumeButtonElem.querySelector('img').src = "./icons/volume-max-svgrepo-com.svg";
    } else {
        isMuted = true;
    }
});
