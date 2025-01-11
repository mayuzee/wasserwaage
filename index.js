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

const point1 = new Point2D(0.5, 0.5);
const point2 = new Point2D(0.2, 0.3);
const point3 = point1 * point2;
console.log(point3);

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

let rotationX = 0;
let rotationY = 0;
let isRotating = false;
let rotorAngle = 0;
let initialAngle = Math.PI / 4;

// for testing ui make both rotations change from 0 to 1 and back to 0 periodically
setInterval(() => {
    rotationX = Math.cos(Date.now() / 1000) / 2 + 0.5;
    rotationY = Math.sin(Date.now() / 1000) / 2 + 0.5;
    updatePositions();
}, 1000 / 60);

function updatePositions() {
    const { width, height } = container.getBoundingClientRect();
    const rotorPosition = new Point2D(0.812, 0.32);
    rotor.style.left = rotorPosition.x * width + 'px';
    rotor.style.top = rotorPosition.y * height + 'px';

    const bubbleVerticalPosition = bubbleVerticalRange.position(rotationY);
    const bubbleVerticalScaleX = 0.6 + Math.abs(0.5 - rotationY) * 0.8;
    bubbleVerticalPosition.x +=
        (rotationX * 0.02 - 0.01) * (1 - bubbleVerticalScaleX);
    bubbleVerticalPosition.applyToElement(bubbleVertical, width, height);
    scaleBubble(
        bubbleVertical,
        bubbleVerticalScaleX,
        1 - Math.abs(0.5 - rotationY) * 0.8
    );

    const bubbleHorizontalPosition = bubbleHorizontalRange.position(rotationX);
    const bubbleHorizontalScaleY = 0.6 + Math.abs(0.5 - rotationX) * 0.8;
    bubbleHorizontalPosition.y -=
        (rotationY * 0.04 - 0.02) * (1 - bubbleHorizontalScaleY);
    bubbleHorizontalPosition.applyToElement(bubbleHorizontal, width, height);
    scaleBubble(
        bubbleHorizontal,
        1 - Math.abs(0.5 - rotationX) * 0.5,
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

    const positionFactorX = (0.5 - rotationX) * angleDelta.x;
    const positionFactorY = (rotationY - 0.5) * angleDelta.y;
    const positionFactor = positionFactorX + positionFactorY + 0.5;
    const offsetX = (rotationX - 0.5) * (1 - angleDelta.x / 2);
    const offsetY = (0.5 - rotationY) * (1 - angleDelta.y / 2);

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

updatePositions();
window.addEventListener('resize', updatePositions);

// helper for development
container.onclick = (e) => {
    const x = e.offsetX / container.offsetWidth;
    const y = e.offsetY / container.offsetHeight;
    console.log(x, y);
};

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
        rotor.style.transform = `rotate(${rotorAngle}rad)`;
        console.log(rotorAngle);
    }
};

document.onmouseup = () => {
    isRotating = false;
};
