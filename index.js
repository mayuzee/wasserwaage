const requestPermission = document.getElementById('requestPermission');

let alpha, beta, gamma;

requestDeviceOrientation();

function handleOrientation(e) {
  alpha = Math.round(e.alpha * 100)/100;
  beta = Math.round(e.beta * 100)/100;
  gamma = Math.round(e.gamma * 100)/100;
}

async function requestDeviceOrientation() {
  // check if iOs 13+
  if (typeof DeviceOrientationEvent != "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOs 13+
    try {
      const permissionState = await DeviceOrientationEvent.requestPermission();
      if (permissionState === 'granted') {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    } catch(error) {
      console.error(error);
    }
  } else if ("DeviceOrientationEvent" in window) {
    window.addEventListener("deviceorientation", handleOrientation);
  } else {
    alert("not supported");
  }
}

