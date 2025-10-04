export let audio = null;

let isPlaying = false;

export function initAudioPlayer() {
  const fileInput = document.getElementById("file-input");
  const playBtn = document.querySelector(".play-btn svg path");
  const volumeValue = document.querySelector(".volume-value");

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      audio = new Audio(fileURL);
      audio.addEventListener("volumechange", () => {
        const v = Math.round(audio.volume * 100);
        volumeValue.textContent = v;
      });
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
