import React, { Component } from 'react';
import jwtDecode from 'jwt-decode';
import $ from 'jquery';
import toastr from 'toastr';

export default class GameForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowsActive: true,
      macActive: false,
      isPrivate: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBuildClick = this.handleBuildClick.bind(this);
    this.handleBuildFileChange = this.handleBuildFileChange.bind(this);
    this.togglePermission = this.togglePermission.bind(this);
  }

  handleBuildFileChange(e) {
    const { getSignedRequest } = this.props;

    const files = e.target.files;
    const file = files[0];

    if(file == null){
      return
    }

    const $target = $(e.target);
    const isWinBuild = ($target.attr('id') == 'windowsBuild');

    getSignedRequest(file, isWinBuild);
  }

  handleSubmit(event) {
    event.preventDefault();
    const { windowsActive, macActive, isPrivate } = this.state;
    const { macURL, winURL, isUploading, macName, winName } = this.props;

    const nameRef = this.refs.name;
    const descriptionRef = this.refs.description;
    const imgURLRef = this.refs.imgURL;
    const backgroundImgRef = this.refs.backgroundImg;
    const macBuildRef = this.refs.macBuild;
    const windowsBuildRef = this.refs.windowsBuild;
    const videoLinksRef = this.refs.videoLinks;
    const galleryLinksRef = this.refs.galleryLinks;
    const winExeRef = this.refs.winExe;

    if (!nameRef.value) {
      nameRef.focus();
      this.showError("Name field must not be empty.")
      return
    }
    else if (!descriptionRef.value) {
      descriptionRef.focus();
      this.showError("Description field must not be empty.");
      return
    }
    else if (!imgURLRef.value) {
      imgURLRef.focus();
      this.showError("Image field must not be empty.");
      return
    }
    else if (!windowsActive && !macActive) {
      this.showError("You must select at least one OS.");
      return
    }
    else if (windowsActive && windowsBuildRef.files.length == 0) {
      this.showError("Please add a Windows build or deselect the OS.");
      return
    }
    else if (macActive && macBuildRef.files.length == 0) {
      this.showError("Please add a macOS build or deselect the OS.");
      return
    }
    else if (!videoLinksRef.value) {
      this.showError("Please add at least one video. Remember to separate them with whitespaces!");
      return
    }
    else if (!galleryLinksRef.value) {
      this.showError("Please add at least one image for the gallery. Remember to separate them with whitespaces!");
      return
    }
    else if (!winExeRef.value && windowsActive) {
      this.showError("Please write the name of your windows .exe file.");
    }

    const videos = videoLinksRef.value.match(/\S+/g);
    const images = galleryLinksRef.value.match(/\S+/g);

    const availableOn = {
      windows: this.state.windowsActive,
      macOS: this.state.macActive,
    }

    let token = localStorage.getItem('id_token');
    let currentUser = jwtDecode(token);

    const game = {
      name: nameRef.value,
      description: descriptionRef.value,
      img: imgURLRef.value,
      backgroundImg: backgroundImgRef.value,
      availableOn,
      videoLinks: videos,
      galleryLinks: images,
      developer: currentUser._id,
      macBuildURL: macURL,
      winBuildURL: winURL,
      macFilename: macName,
      winFilename: winName,
      winExe: winExeRef.value,
      isPrivate,
    }

    this.props.addGame(game);
    this.props.changeRoute('/');
  }

  showError(message) {
    toastr.error(message);
  }

  handleBuildClick(event) {
    event.preventDefault();
    const $parent = $(event.target.parentElement);
    const elementId = event.target.parentElement.getAttribute('href');
    const $targetElement = $(elementId)

    switch (elementId) {
      case "#windowsBuild":
        this.setState({ windowsActive: !this.state.windowsActive });
        $('.win-exe').toggleClass('hidden');
        $('#win-br').toggleClass('hidden');
        break;
      case "#appleBuild":
        this.setState({ macActive: !this.state.macActive });
        $('#mac-br').toggleClass('hidden');
        break;
      default: break;
    }

    $targetElement.toggleClass('hidden');
    $parent.toggleClass('os-selected');
  }

  togglePermission(e) {
    e.preventDefault();

    this.setState({ isPrivate: !this.state.isPrivate })
  }

  handleLinkString(event) {
    let linkString = event.target.value
    let linkArr = linkString.match(/\S+/g);
    console.log(linkArr);
  }

  render() {
    const { isUploading } = this.props;
    const { isPrivate } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label className="input-tag">NAME</label>
          <input className="gf-input" type="text" ref="name" />
        </div>
        <div>
          <label className="input-tag">SHORT DESCRIPTION</label>
          <textarea className="gf-textarea" type="text" ref="description" />
        </div>
        <div>
          <label className="input-tag">SMALL IMAGE URL (460 x 215 recommended)</label>
          <input className="gf-input" type="text" ref="imgURL" />
        </div>
        <div>
          <label className="input-tag">COVER IMAGE URL (1080 x 350 recommended)</label>
          <input className="gf-input" type="text" ref="backgroundImg" />
        </div>
        <p className="builds-subtitle input-tag">GAME BUILDS</p>
        <div className="os-picker row">
          <div className="col-md-6">
            <a href="#windowsBuild" onClick={this.handleBuildClick} className="os-selected"><i className="fa fa-windows" /></a>
          </div>
          <div className="col-md-6">
            <a href="#appleBuild" onClick={this.handleBuildClick}><i className="fa fa-apple" /></a>
          </div>
        </div>
        <div className="row builds">
          <div className="col-md-6">
            <input id="windowsBuild" type="file" accept=".zip" ref="windowsBuild" onChange={this.handleBuildFileChange} />
            <p id="win-br" className="build-reqs">Must be a .zip file containing the .exe on the first layer of the .zip file. (So yourgame.zip/yourgame.exe is good, but yourgame.zip/rand_dir/yourgame.exe is bad)</p>
          </div>
          <div className="col-md-6">
            <input id="appleBuild" className="hidden" type="file" accept=".zip" ref="macBuild" onChange={this.handleBuildFileChange}/>
            <p id="mac-br" className="build-reqs hidden">Must be a .zip file containing only your .app build for your game.</p>
          </div>
        </div>
        <div className="win-exe">
          <label className="input-tag">NAME OF YOUR WINDOWS .exe FILE (i.e. GAME.exe)</label>
          <input className="gf-input" type="text" ref="winExe" />
        </div>
        <div>
          <label className="input-tag">GALLERY VIDEO URLs (Separate them with a whitespace)</label>
          <input className="gf-input" type="text" ref="videoLinks" />
        </div>
        <div>
          <label className="input-tag">GALLERY IMAGE URLs (Separate them with a whitespace)</label>
          <input className="gf-input" type="text" ref="galleryLinks" />
        </div>
        {isPrivate &&
          <div>
            <a href="#" className="btn private-btn active" onClick={this.togglePermission}><i className="fa fa-lock"></i> Private</a>
            <a href="#" className="btn public-btn" onClick={this.togglePermission}><i className="fa fa-globe"></i> Public</a>
            <p className="input-tag private">INVITE ONLY</p>
          </div>
        }
        {!isPrivate &&
          <div>
            <a href="#" className="btn private-btn" onClick={this.togglePermission}><i className="fa fa-lock"></i> Private</a>
            <a href="#" className="btn public-btn active" onClick={this.togglePermission}><i className="fa fa-globe"></i> Public</a>
            <p className="input-tag public">AVAILABLE FOR EVERYONE</p>
          </div>
        }
        {!isUploading &&
          <a href="#" className="btn play-btn" onClick={this.handleSubmit}>Submit game</a>
        }
        {isUploading &&
          <div>
            <a href="#" className="btn play-btn disabled">Create</a>
            <span>Upload in progress <i className="fa fa-spinner fa-pulse fa-fw"></i></span>
          </div>
        }
      </form>
    )
  }
}
