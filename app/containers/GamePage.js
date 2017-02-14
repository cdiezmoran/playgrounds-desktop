import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { desktopCapturer } from 'electron';
import MediaStreamRecorder, { MediaRecorderWrapper, WhammyRecorder } from 'msr';
import ffmpeg from 'fluent-ffmpeg';
import $ from 'jquery';

import GameShow from '../components/Game/GameShow';

import { fetchGameIfNeeded } from '../actions/game';
import { getGame } from '../reducers/game';
import { uploadFileRequest } from '../actions/feedback';

let mediaRecorder;
let blobs = [];

const spawn = require('child_process').spawn;
const execFile = require('child_process').exec;

class GamePage extends Component {
  constructor(props) {
    super(props);

    this.startCapture = this.startCapture.bind(this);
    this.handleOpenGameProcess = this.handleOpenGameProcess.bind(this);
  }

  componentWillMount() {
    const { dispatch, params } = this.props
    dispatch(fetchGameIfNeeded(params.id))
  };

  handleOpenGameProcess(playable) {
    /* Possible windows process
    const child = execFile(localPath, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    });*/

    // Open a game in macOS maybe Linux aswell

    const { game } = this.props

    let localPath;
    playable.forEach((playableGame) => {
      if (game.name.toLowerCase() == playableGame.name) {
        localPath = playableGame.path;
      }
    });

    const gameProcess = spawn('open', ['-a', localPath, '--wait-apps']);

    gameProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      this.stopCapture();
    });

    setTimeout(() => this.startCapture(), 5000);
  };

  startCapture() {
    const { game } = this.props;
    // Get sources and select which one we want using props
    console.log("Record function called for " + game.name);

    let selectedSource = null
    let entireScreen

    desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
      const lowerCaseName = game.name.toLowerCase();

      for(let source of sources) {
        let lowerCaseSource = source.name.toLowerCase();
        if (lowerCaseSource.includes(lowerCaseName)) {
          selectedSource = source.id
        }
        if (source.name == "Entire screen") {
          entireScreen = source.id
        }
      }

      if (!selectedSource) {
        selectedSource = entireScreen
      }

      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      }).then((stream) => {
        mediaRecorder = new MediaStreamRecorder(stream);
        mediaRecorder.mimeType = 'video/webm';
        mediaRecorder.recorderType = WhammyRecorder;

        mediaRecorder.canvas = {
          width: 1280,
          height: 720
        };

        mediaRecorder.videoWidth  = 1280;
        mediaRecorder.videoHeight = 720;

        mediaRecorder.ondataavailable = (blob) => {
          blobs.push(blob);
          //mediaRecorder.save(blob, new Date().getTime() + "-custom.webm");
        }

        mediaRecorder.start(5 * 5000);

      }).catch((error) => {
        console.log(error);
      });
    });
  }

  stopCapture() {
    if(mediaRecorder) {
      mediaRecorder.stop();

      setTimeout(() => this.manageCapturedBlobs(), 1000)
    }
  }

  manageCapturedBlobs() {
    const { dispatch, game } = this.props

    console.log(blobs);

    /*ConcatenateBlobs(blobs, 'video/webm', function(resultingBlob) {
      let filename = game.name + new Date().getTime();

      let formData = new FormData();
      formData.append('upl', resultingBlob, filename + '.webm');
      dispatch(uploadFileRequest(formData));

      // or preview locally
      //localVideo.src = URL.createObjectURL(resultingBlob);
    });*/

    let mergedVideo = blobs[0];

    /*if (blobs.length > 1) {
      let proc = ffmpeg(blobs[0])
      for (var i = 1; i < blobs.length; i++) {
        proc.input(blobs[i])
      }
      proc.on('end', function() {
        console.log('files merged succesfully.');
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message);
      })
      .mergeToFile('./merged.mp4');
    }*/

    let name = game.name.replace(/\s+/g, '');
    let filename = name + new Date().getTime() + '.webm';

    let formData = new FormData();
    formData.append('upl', mergedVideo, filename);

    let gameplay = {
      s3URL: 'https://s3-us-west-1.amazonaws.com/playgrounds-bucket/' + filename,
      cloudfrontURL: 'http://d2g3olpfntndgi.cloudfront.net/' + filename,
      createdAt: Date.now(),
      key: filename
    }

    let feedback = {
      good: "I liked how you can do this thing in the game",
      better: "You could try improving this",
      best: "I loved how you did this thing",
      gameId: game._id
    }

    dispatch(uploadFileRequest(formData, feedback, gameplay));
  }

  render() {
    const { game, isFetching } = this.props;
    return (
      <div>
        {isFetching && !game &&
          <h2>Loading...</h2>
        }
        {!isFetching && !game &&
          <h2>Empty.</h2>
        }
        {game &&
          <GameShow game={this.props.game} openGame={this.handleOpenGameProcess} stopCapture={this.stopCapture}/>
        }
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    game: getGame(state, props.params.id)
  };
}

export default connect(mapStateToProps)(GamePage)
