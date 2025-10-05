export let audio = null;

let isPlaying = false;

export function initAudioPlayer() {
  const fileInput = document.getElementById("file-input");
  const playBtn = document.querySelector(".play-btn svg path");
  const volumeValue = document.querySelector(".volume-value");
  const durationSpan = document.querySelector(".duration-time");
  const currentTimeSpan = document.querySelector(".current-time");
  const progressBar = document.querySelector(".progress-bar");

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      if (!audio) {
        audio = new Audio(fileURL);
        audio.volume = 0.2;
        audio.addEventListener("volumechange", () => {
          const v = Math.round(audio.volume * 100);
          volumeValue.textContent = v;
        });

        audio.addEventListener("loadedmetadata", () => {
          const duration = audio.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          durationSpan.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`;
        });

        audio.addEventListener("timeupdate", () => {
          const currentTime = audio.currentTime;
          const duration = audio.duration;
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          currentTimeSpan.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`;
          if (duration > 0) {
            progressBar.value = (currentTime / duration) * 100;
          }
        });
      } else {
        audio.src = fileURL;
      }
      isPlaying = false;
      playBtn.setAttribute("d", "M8 5v14l11-7z");
      document.querySelector(".music-title").textContent = file.name;
    }
  });

  document.querySelector(".play-btn").addEventListener("click", () => {
    if (!audio) {
      alert("Please select an audio file first");
      return;
    }
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      playBtn.setAttribute("d", "M8 5v14l11-7z");
    } else {
      audio.play();
      isPlaying = true;
      playBtn.setAttribute("d", "M6 5h4v14H6zM14 5h4v14h-4z");
    }
  });
}
