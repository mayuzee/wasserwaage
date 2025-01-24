import { navigateToPage } from '../www/index.js';

export function load() {
    class Point2D {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        applyToElement(element, width, height) {
            element.style.left = this.x * width + 'px';
            element.style.top = this.y * height + 'px';
        }

        add(value) {
            if (value instanceof Point2D) {
                return new Point2D(this.x + value.x, this.y + value.y);
            } else {
                return new Point2D(this.x + value, this.y + value);
            }
        }

        multiply(value) {
            if (value instanceof Point2D) {
                return new Point2D(this.x * value.x, this.y * value.y);
            } else {
                return new Point2D(this.x * value, this.y * value);
            }
        }
    }

    class PointRange {
        constructor(min, max) {
            this.min = min;
            this.max = max;
        }

        position(value) {
            return new Point2D(
                this.min.x + value * (this.max.x - this.min.x),
                this.min.y + value * (this.max.y - this.min.y)
            );
        }
    }

    const requestPermission = document.getElementById('request-permission');
    const alphaElement = document.getElementById('alpha');
    const betaElement = document.getElementById('beta');
    const gammaElement = document.getElementById('gamma');

    let alpha = 0;
    let beta = 0;
    let gamma = 0;
    const averageOver = 1;
    const updateDelay = 1000 / 30;
    let lastUpdate = 0;
    let infoShown = false;
    let permissionState = 'denied';

    function handleOrientation(e) {
        const now = Date.now();
        if (now - lastUpdate < updateDelay) return;
        lastUpdate = now;

        function formatValue(value) {
            const sign = value < 0 ? '-' : '&nbsp;&nbsp;&nbsp;';
            const absoluteValue = Math.abs(value).toFixed(2).padStart(6, '0');
            return sign + absoluteValue;
        }

        alpha = e.alpha;
        beta = e.beta;
        gamma = e.gamma;

        alphaElement.innerHTML = `Z: ${formatValue(alpha)}°`;
        gammaElement.innerHTML = `Y: ${formatValue(gamma)}°`;
        betaElement.innerHTML = `X: ${formatValue(beta)}°`;
        updatePositions();
    }

    // window.requestDeviceOrientation = requestDeviceOrientation;

    async function requestDeviceOrientation() {
        permissionState = 'awaiting';
        removeInfo();

        // check if iOs 13+
        if (
            typeof DeviceOrientationEvent != 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
            // iOs 13+
            try {
                permissionState =
                    await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener(
                        'deviceorientation',
                        handleOrientation
                    );
                } else {
                    console.error('Permission could not be granted');
                    alert('Zugriff auf Bewegungssensoren wurde verweigert');
                }
            } catch (error) {
                showInfo(
                    'Bitte erlauben Sie Zugriff auf die Bewegungssensoren. <button onclick="requestDeviceOrientation()">Ok</button>',
                    null
                );
            }
        } else if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', handleOrientation);
        } else {
            alert('Ihr Gerät unterstützt keine Bewegungssensoren');
        }
    }

    function scaleBubble(bubble, x, y) {
        bubble.style.transform = `scale(${x}, ${y})`;
    }

    const rotor = document.querySelector('.rotor');
    const container = document.querySelector('.wasserwaage');
    const bubbleVertical = document.querySelector('.bubble.vertical');
    const bubbleHorizontal = document.querySelector('.bubble.horizontal');
    const bubbleRotor = document.querySelector('.bubble.rotating');

    const bubbleVerticalRange = new PointRange(
        new Point2D(0.143, 0.48),
        new Point2D(0.143, 0.36)
    );
    const bubbleHorizontalRange = new PointRange(
        new Point2D(0.471, 0.332),
        new Point2D(0.522, 0.332)
    );

    let normalizedOffsetX, normalizedOffsetY;
    let isRotating = false;
    let rotorAngle = 0;
    let initialAngle = Math.PI / 4;

    function updateRotations() {
        let yOrientation, xOrientation;

        if (permissionState === 'denied' && !infoShown)
            requestDeviceOrientation();

        if (permissionState === 'granted') {
            if (
                screen.orientation.type === 'portrait-primary' ||
                screen.orientation.type === 'portrait-secondary'
            ) {
                if (infoShown) return;
                showInfo(
                    'Drehen Sie Ihr Gerät für die optimale ✨Experience✨'
                );
                return;
            } else if (infoShown) {
                removeInfo();
            }
        }

        switch (screen.orientation.type) {
            case 'landscape-primary':
                xOrientation = -beta;
                yOrientation = -gamma;
                break;
            case 'landscape-secondary':
                xOrientation = beta;
                yOrientation = gamma;
                break;
            case 'portrait-secondary':
                xOrientation = gamma;
                yOrientation = -beta;
                break;
            case 'portrait-primary':
                xOrientation = -gamma;
                yOrientation = beta;
                break;
            default:
                xOrientation = -gamma;
                yOrientation = beta;
                console.warn(
                    "The orientation API isn't supported in this browser"
                );
        }

        normalizedOffsetX = Math.min(1, Math.max(0, xOrientation / 90 + 0.5));
        normalizedOffsetY = Math.min(1, Math.max(0, yOrientation / 90 + 0.5));
    }

    function updatePositions() {
        updateRotations();

        const { width, height } = container.getBoundingClientRect();
        const rotorPosition = new Point2D(0.812, 0.32);
        rotorPosition.applyToElement(rotor, width, height);

        const bubbleVerticalPosition =
            bubbleVerticalRange.position(normalizedOffsetY);
        const bubbleVerticalScaleX =
            0.6 + Math.abs(0.5 - normalizedOffsetY) * 0.8;
        bubbleVerticalPosition.x +=
            (normalizedOffsetX * 0.02 - 0.01) * (1 - bubbleVerticalScaleX);
        bubbleVerticalPosition.applyToElement(bubbleVertical, width, height);
        scaleBubble(
            bubbleVertical,
            bubbleVerticalScaleX,
            1 - Math.abs(0.5 - normalizedOffsetY) * 0.8
        );

        const bubbleHorizontalPosition =
            bubbleHorizontalRange.position(normalizedOffsetX);
        const bubbleHorizontalScaleY =
            0.6 + Math.abs(0.5 - normalizedOffsetX) * 0.8;
        bubbleHorizontalPosition.y -=
            (normalizedOffsetY * 0.04 - 0.02) * (1 - bubbleHorizontalScaleY);
        bubbleHorizontalPosition.applyToElement(
            bubbleHorizontal,
            width,
            height
        );
        scaleBubble(
            bubbleHorizontal,
            1 - Math.abs(0.5 - normalizedOffsetX) * 0.5,
            bubbleHorizontalScaleY
        );

        const rotorCenter = new Point2D(0.849, 0.431);
        const rotorRadius = new Point2D(0.025, 0.05);
        const angleShift = 0.79;
        const angleDelta = new Point2D(
            Math.cos(rotorAngle - angleShift),
            Math.sin(rotorAngle - angleShift)
        );

        const rotorDelta = angleDelta.multiply(rotorRadius);

        const rotorRange = new PointRange(
            rotorCenter.add(rotorDelta),
            rotorCenter.add(rotorDelta.multiply(-1))
        );

        const positionFactorX = (0.5 - normalizedOffsetX) * angleDelta.x;
        const positionFactorY = (normalizedOffsetY - 0.5) * angleDelta.y;
        const positionFactor = positionFactorX + positionFactorY + 0.5;
        const offsetX = (normalizedOffsetX - 0.5) * (1 - angleDelta.x / 2);
        const offsetY = (0.5 - normalizedOffsetY) * (1 - angleDelta.y / 2);

        const bubbleRotorPosition = rotorRange
            .position(Math.max(0, Math.min(1, positionFactor)))
            .add(new Point2D(offsetX * 0.004, offsetY * 0.015));

        bubbleRotorPosition.applyToElement(bubbleRotor, width, height);
        scaleBubble(
            bubbleRotor,
            1 - Math.abs(offsetX) * 0.5,
            1 - Math.abs(offsetY) * 0.5
        );
    }

    window.addEventListener('resize', updatePositions);
    window.addEventListener('load', updatePositions);

    function handleClick(e) {
        isRotating = true;
        initialAngle = rotorAngle;
        e.preventDefault();
    }

    function rotateEnd() {
        isRotating = false;
    }

    rotor.onmousedown = handleClick;
    rotor.ontouchstart = handleClick;
    rotor.onmouseup = rotateEnd;
    rotor.ontouchend = rotateEnd;

    rotor.onclick = (e) => {
        const { x, y, width, height } = rotor.getBoundingClientRect();
        const dx = e.clientX - x - width / 2;
        const dy = e.clientY - y - height / 2;
        rotorAngle = Math.atan2(dy, dx) + Math.PI / 4;
        rotor.style.transform = `rotate(${rotorAngle}rad)`;

        updatePositions();
    };

    document.onmousemove = (e) => {
        if (isRotating) {
            const { x, y, width, height } = rotor.getBoundingClientRect();
            const dx = e.clientX - x - width / 2;
            const dy = e.clientY - y - height / 2;
            rotorAngle = Math.atan2(dy, dx) - initialAngle;
            rotor.style.transform = `rotate(${rotorAngle}rad)`;

            updatePositions();
        }
    };

    rotor.ontouchmove = (e) => {
        if (isRotating) {
            const touch = e.touches[0];
            const { x, y, width, height } = rotor.getBoundingClientRect();
            const dx = touch.clientX - x - width / 2;
            const dy = touch.clientY - y - height / 2;
            rotorAngle = Math.atan2(dy, dx) - initialAngle;
            rotor.style.transform = `rotate(${rotorAngle}rad)`;

            updatePositions();
            e.preventDefault();
        }
    };

    function removeInfo() {
        const info = document.querySelector('.info');
        if (!info) return;

        info.classList.add('hide');
        infoShown = false;
        setTimeout(() => {
            info.remove();
        }, 1000);
    }

    function showInfo(message, showTime) {
        infoShown = true;
        const info = document.createElement('div');
        info.classList.add('info');
        info.innerHTML = message;
        document.body.appendChild(info);

        if (showTime == null) return;
        setTimeout(removeInfo, showTime);
    }

    // online/offline detection
    const network_status_element = document.getElementById('network-status');
    let networkStatus;
    detectNetworkStatus();

    window.addEventListener('offline', (event) => {
        detectNetworkStatus();
    });

    window.addEventListener('online', (event) => {
        detectNetworkStatus();
    });

    function detectNetworkStatus() {
        networkStatus = navigator.onLine;
        if (networkStatus) {
            network_status_element.innerText = 'online';
            network_status_element.style.backgroundColor = '#70dd85';
        } else {
            network_status_element.innerText = 'offline';
            network_status_element.style.backgroundColor = '#d9971c';
        }
    }

    const saveValuesButton = document.getElementById('save-values');

    saveValuesButton.onclick = navigateToPage('saved_tilt_angles');
}
