// @flow
import React, { Component } from 'react';
import Video from '../utils/video';

export default class VideoPlayer extends Component {
  props: {
    src: string
  }

  render() {
    const { src } = this.props;

    return (
      <Video
        src={src} id="home_video" className="video-js vjs-default-skin" controls
        preload="auto" width="720" height="380"
        poster="https://i.ytimg.com/vi/NpEaa2P7qZI/maxresdefault.jpg"
      />
    );
  }
}
