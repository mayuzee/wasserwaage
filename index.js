const bubbles = document.querySelectorAll('.bubble');
const rotor = document.querySelector('.rotor');
const container = document.querySelector('.wasserwaage');

class RelativePosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function updatePositions() {
    const { width, height } = container.getBoundingClientRect();
    const rotorPosition = new RelativePosition(0.812, 0.32);
    console.log(width, height, rotorPosition);
    rotor.style.left = rotorPosition.x * width + 'px';
    rotor.style.top = rotorPosition.y * height + 'px';
}

updatePositions();
window.addEventListener('resize', updatePositions);

// helper for development
container.onclick = (e) => {
    const x = e.offsetX / container.offsetWidth;
    const y = e.offsetY / container.offsetHeight;
    console.log(x, y);
};

let isRotating = false;
let rotorAngle = 0;
let initialAngle = Math.PI / 4;

rotor.onmousedown = () => {
    isRotating = true;
    initialAngle = rotorAngle;
};

rotor.onclick = (e) => {
    const { x, y, width, height } = rotor.getBoundingClientRect();
    const dx = e.clientX - x - width / 2;
    const dy = e.clientY - y - height / 2;
    rotorAngle = Math.atan2(dy, dx) + Math.PI / 4;
    rotor.style.transform = `rotate(${rotorAngle}rad)`;
};

document.onmousemove = (e) => {
    if (isRotating) {
        const { x, y, width, height } = rotor.getBoundingClientRect();
        const dx = e.clientX - x - width / 2;
        const dy = e.clientY - y - height / 2;
        rotorAngle = Math.atan2(dy, dx) - initialAngle;
        console.log(dx, dy, Math.atan2(dy));
        rotor.style.transform = `rotate(${rotorAngle}rad)`;
    }
};

document.onmouseup = () => {
    isRotating = false;
};

const requestPermission = document.getElementById('requestPermission');
const alphaElement = document.getElementById('alpha');
const betaElement = document.getElementById('beta');
const gammaElement = document.getElementById('gamma');

let alpha, beta, gamma;

requestDeviceOrientation();

function handleOrientation(e) {
  function formatValue(value) {
    const sign = value < 0 ? '-' : ''; 
    const absoluteValue = Math.abs(value).toFixed(2).padStart(6, '0'); 
    return sign + absoluteValue;
  }
  
  let alpha = formatValue(e.alpha);
  let beta = formatValue(e.beta);
  let gamma = formatValue(e.gamma);
  
  alphaElement.innerHTML = `Z-Achse: ${alpha}°`;
  betaElement.innerHTML = `X-Achse: ${beta}°`;
  gammaElement.innerHTML = `Y-Achse: ${gamma}°`;
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

