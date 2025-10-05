import { audio } from "./player.js";

export function initVolumeControl() {
  const UserInputState = {
    IDLE: 0,
    HOVERING_BUTTON: 1,
    WAITING_FOR_RESPONSE: 2,
    DRAGGING_SLIDER: 3,
  };
  let currentState = UserInputState.IDLE;
  let closeTimeoutId = null;

  const volumeBtn = document.querySelector(".volume-btn");
  const volumeSlider = document.querySelector(".volume-slider");
  const volumePopup = document.querySelector(".volume-popup");
  const volumeValue = document.querySelector(".volume-value");

  volumeSlider.addEventListener("input", () => {
    const v = volumeSlider.value;
    volumeValue.textContent = v;
    if (audio) {
      audio.volume = v / 100;
    }
  });

  const clearWaitingTimer = () => {
    if (closeTimeoutId != null) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = null;
    }
  };

  const hideSliderAndReturnToIdle = () => {
    volumePopup.style.display = "none";
    currentState = UserInputState.IDLE;
    clearWaitingTimer();
  };

  volumeBtn.addEventListener("mouseenter", () => {
    if (
      currentState === UserInputState.IDLE ||
      currentState === UserInputState.WAITING_FOR_RESPONSE
    ) {
      clearWaitingTimer();
      currentState = UserInputState.HOVERING_BUTTON;
      volumePopup.style.display = "flex";
      volumePopup.style.flexDirection = "column";
    }
  });

  volumeBtn.addEventListener("mouseleave", () => {
    if (currentState === UserInputState.HOVERING_BUTTON) {
      currentState = UserInputState.WAITING_FOR_RESPONSE;

      closeTimeoutId = setTimeout(() => {
        if (currentState === UserInputState.WAITING_FOR_RESPONSE) {
          hideSliderAndReturnToIdle();
        }
      }, 100);
    }
  });

  volumePopup.addEventListener("mouseenter", () => {
    if (currentState === UserInputState.WAITING_FOR_RESPONSE) {
      clearWaitingTimer();
      currentState = UserInputState.DRAGGING_SLIDER;
    }
  });

  volumePopup.addEventListener("mouseleave", () => {
    if (currentState === UserInputState.DRAGGING_SLIDER) {
      hideSliderAndReturnToIdle();
    }
  });
}
