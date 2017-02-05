import React, { Component } from 'react';
import $ from 'jquery';

var $refreshButton = $('#refresh');
var $results = $('#css_result');

export default class VideoPlayer extends Component {
  componentDidMount() {
    this.refresh();
    $refreshButton.click(this.refresh());

    // Select all the contents when clicked
    $results.click(function(){
      $(this).select();
    });
  }

  refresh(){
    var css = $('style.cp-pen-styles').text();
    $results.html(css);
  }

  render() {
    const { gameplay } = this.props;
    return (
      <video id="home_video" className="video-js vjs-default-skin" controls preload="none" width="720" height="380"
        poster="https://i.ytimg.com/vi/NpEaa2P7qZI/maxresdefault.jpg" data-setup=''>
        <source src='http://d2g3olpfntndgi.cloudfront.net/hre.mp4' type='video/mp4'/>
      </video>
    )
  }
}
