# HTML5-video-player

A zero dependency HTML5 custom video player

Features
1. Enhanced UI
2. You can fast forword the video using mouse/touchpad by clicking or you can use arrow keys which will fastforword the video by 5s
3. You can use space bar to play and pause
4. You can drag the progress bar to fastforword the video
5. Image previews when hovering over progress bar
6. Full screen option
7. picture in picture
8. mute/unmute buttons
9. pause screen
10. Auto hide of controls when video is playing

    https://github.com/abhijith-k07/HTML5-video-player/assets/88900086/679dd61c-c328-445a-82a5-a4e56e0d4cfd

## image Preview
The image preview needs backend to generate the preview images called sprite images.
To generate sprite images i have used a python script from this repo https://github.com/flavioribeiro/video-thumbnail-generator

The player currently call an end point to get one such sprite image, in a real scenario we need to
automate this process for every video and generate multiple sprite videos for multiple timelines.
The player currently doesn't support this.
