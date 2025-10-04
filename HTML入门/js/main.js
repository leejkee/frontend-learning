import { initAudioPlayer } from "./player.js";
import { initVolumeControl } from "./volume-control.js";

document.addEventListener("DOMContentLoaded", () => {
    initAudioPlayer();
    initVolumeControl();
});