class CustomVideoPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.container = document.getElementById('videoContainer');
        this.controls = document.getElementById('controls');
        this.loading = document.getElementById('loading');
        
        // Control elements
        this.playBtn = document.getElementById('playBtn');
        this.skipBackBtn = document.getElementById('skipBackBtn');
        this.skipForwardBtn = document.getElementById('skipForwardBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.bufferBar = document.getElementById('bufferBar');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.speedBtn = document.getElementById('speedBtn');
        this.speedMenu = document.getElementById('speedMenu');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        // State
        this.isPlaying = false;
        this.isMuted = false;
        this.currentSpeed = 1;
        this.hideControlsTimeout = null;

        this.init();
    }

    handleOrientationChange() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isMobile = window.innerWidth <= 768;
    const isPlaying = !this.video.paused;

    if (isMobile && isLandscape && isPlaying) {
        this.enterLandscapeMode();
    } else {
        this.exitLandscapeMode();
    }
    }

    enterLandscapeMode() {
    this.container.classList.add('landscape-fill');

    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
    }




    init() {
        this.setupEventListeners();
        this.hideLoading();

        // Check centering on video load
       this.video.addEventListener('loadedmetadata', () => this.centerVideoIfNeeded());

        window.addEventListener('resize', () => this.centerVideoIfNeeded());
        
        document.addEventListener('fullscreenchange', () => this.centerVideoIfNeeded());

    }

    // center video
    centerVideoIfNeeded() {
    this.container.classList.add('centered');

}


    setupEventListeners() {
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        this.video.addEventListener('playing', () => this.hideLoading());
        this.video.addEventListener('loadstart', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('progress', () => this.updateBuffer());
        this.video.addEventListener('ended', () => this.videoEnded());
        this.video.addEventListener('click', () => this.togglePlay());

        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.skipBackBtn.addEventListener('click', () => this.skipTime(-10));
        this.skipForwardBtn.addEventListener('click', () => this.skipTime(10));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        this.speedBtn.addEventListener('click', () => this.toggleSpeedMenu());
        this.speedMenu.addEventListener('click', (e) => this.setSpeed(e));

        this.container.addEventListener('mouseenter', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.startHideControlsTimer());
        this.container.addEventListener('mousemove', () => this.showControls());

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('mozfullscreenchange', () => this.updateFullscreenButton());
    }

    showLoading() {
        this.loading.style.display = 'block';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    togglePlay() {
  if (this.video.paused) {
    this.video.play();
    this.playBtn.textContent = '⏸️';
    this.isPlaying = true;
    this.handleOrientationChange(); // <-- Add this
  } else {
    this.video.pause();
    this.playBtn.textContent = '▶️';
    this.isPlaying = false;
    this.exitLandscapeMode(); // <-- Reset on pause
  }
}


    skipTime(seconds) {
        this.video.currentTime += seconds;
    }

    toggleMute() {
        if (this.video.muted) {
            this.video.muted = false;
            this.muteBtn.textContent = '🔊';
            this.volumeSlider.value = this.video.volume;
        } else {
            this.video.muted = true;
            this.muteBtn.textContent = '🔇';
        }
    }

    setVolume(value) {
        this.video.volume = value;
        this.video.muted = false;
        if (value == 0) {
            this.muteBtn.textContent = '🔇';
        } else if (value < 0.5) {
            this.muteBtn.textContent = '🔉';
        } else {
            this.muteBtn.textContent = '🔊';
        }
    }

    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progress.style.width = percent + '%';
        this.updateTimeDisplay();
    }

    updateBuffer() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const duration = this.video.duration;
            const bufferedPercent = (bufferedEnd / duration) * 100;
            this.bufferBar.style.width = bufferedPercent + '%';
        }
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.video.currentTime);
        const duration = this.formatTime(this.video.duration);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = percent * this.video.duration;
    }

    toggleSpeedMenu() {
        this.speedMenu.classList.toggle('show');
    }

    setSpeed(e) {
        if (e.target.classList.contains('speed-option')) {
            const speed = parseFloat(e.target.dataset.speed);
            this.video.playbackRate = speed;
            this.speedBtn.textContent = speed + 'x';
            this.speedMenu.querySelectorAll('.speed-option').forEach(option => {
                option.classList.remove('active');
            });
            e.target.classList.add('active');
            this.speedMenu.classList.remove('show');
        }
    }

    toggleFullscreen() {
    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen(); // Safari
        } else if (this.container.msRequestFullscreen) {
            this.container.msRequestFullscreen();
        } else if (this.container.mozRequestFullScreen) {
            this.container.mozRequestFullScreen(); // Firefox
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    }
}


    updateFullscreenButton() {
        this.fullscreenBtn.textContent = '⛶';
    }

    showControls() {
        this.controls.classList.remove('hidden');
        this.startHideControlsTimer();
    }

    startHideControlsTimer() {
        clearTimeout(this.hideControlsTimeout);
        if (this.isPlaying) {
            this.hideControlsTimeout = setTimeout(() => {
                this.controls.classList.add('hidden');
            }, 3000);
        }
    }

    videoEnded() {
        this.playBtn.textContent = '▶️';
        this.isPlaying = false;
        this.exitLandscapeMode(); // <-- ADD THIS
        this.showControls();
        }

    handleKeyboard(e) {
        if (!this.container.matches(':hover') && document.activeElement !== this.video) return;
        switch(e.code) {
            case 'Space':
                e.preventDefault(); this.togglePlay(); break;
            case 'ArrowLeft':
                e.preventDefault(); this.skipTime(-5); break;
            case 'ArrowRight':
                e.preventDefault(); this.skipTime(5); break;
            case 'ArrowUp':
                e.preventDefault();
                this.video.volume = Math.min(1, this.video.volume + 0.1);
                this.volumeSlider.value = this.video.volume;
                this.setVolume(this.video.volume);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.video.volume = Math.max(0, this.video.volume - 0.1);
                this.volumeSlider.value = this.video.volume;
                this.setVolume(this.video.volume);
                break;
            case 'KeyM':
                e.preventDefault(); this.toggleMute(); break;
            case 'KeyF':
                e.preventDefault(); this.toggleFullscreen(); break;
        }
    }
}

// Initialize player
document.addEventListener('DOMContentLoaded', () => {
    new CustomVideoPlayer();
});

// Close speed menu when clicking outside
document.addEventListener('click', (e) => {
    const speedContainer = document.querySelector('.speed-container');
    const speedMenu = document.getElementById('speedMenu');
    if (!speedContainer.contains(e.target)) {
        speedMenu.classList.remove('show');
    }
});

// Video upload
const videoUpload = document.getElementById('videoUpload');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');

videoUpload.addEventListener('change', function () {
    const file = this.files[0];
    if (file && file.type.startsWith('video/')) {
        const videoURL = URL.createObjectURL(file);
        videoSource.src = videoURL;
        videoPlayer.load();
        videoPlayer.play();
    } else {
        alert('Please upload a valid video file.');
    }
});






