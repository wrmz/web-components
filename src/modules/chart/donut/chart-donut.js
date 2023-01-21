/**
 * @injectHTML
 */
export class ChartDonut extends HTMLElement {
    static get observedAttributes() {
        return [
            'colors',
            'values',
            'labels',
        ];
    }

    static degreesToRadians(angle) {
        return angle * (Math.PI / 180);
    }

    constructor() {
        super();
        this.gap = 2;
        this.cx = 80;
        this.cy = 80;
        this.radius = 60;
        this.angleOffset = -90;
        this.chartData = [];
        this.segmentElems = [];
        this.isLoaded = false;

        this.svg = this.shadowRoot.querySelector('svg');

        this.generateSegment = this.generateSegment.bind(this);
        this.updateSegment = this.updateSegment.bind(this);
    }

    get currencyFormat() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format;
    }

    set colors(v) {
        this.setAttribute('colors', JSON.stringify(v));
    }

    get colors() {
        const colors = (this.getAttribute('colors') || '').replace(/'/g, '"');
        return colors ? JSON.parse(colors) : ['red', 'green', 'blue'];
    }

    set labels(v) {
        this.setAttribute('labels', JSON.stringify(v));
    }

    get labels() {
        const labels = (this.getAttribute('labels') || '').replace(/'/g, '"');
        return labels ? JSON.parse(labels) : [];
    }

    set values(v) {
        this.setAttribute('values', JSON.stringify(v));
    }

    get values() {
        const values = (this.getAttribute('values') || '').replace(/'/g, '"');
        return values ? JSON.parse(values) : [];
    }

    get total() {
        return this.values.length
            ? this.values.reduce((previous, current) => previous + current)
            : 0;
    }

    get circumference() {
        return 2 * Math.PI * this.radius;
    }

    get adjustedCircumference() {
        return this.circumference - this.gap;
    }

    /**
     * Loops through the values and generates a segment for each
     */
    generateSegments() {
        this.values.forEach(this.generateSegment);
    }

    /**
     * Generates an individual segment
     * @param {number} val - The amount this segmenet represents
     * @param {number} i - Index of this value in `this.values`
     */
    generateSegment(val, i) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        const data = {
            degrees: this.angleOffset,
        };

        this.angleOffset += this.dataPercentage(this.values[i]) * 360;
        this.chartData.push(data);

        circle.setAttribute('tabindex', '0');
        circle.setAttribute('cx', this.cx);
        circle.setAttribute('cy', this.cy);
        circle.setAttribute('r', this.radius);
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', this.colors[i]);
        circle.setAttribute('stroke-width', 30);
        circle.setAttribute('stroke-dasharray', this.adjustedCircumference);
        circle.setAttribute('stroke-dashoffset', this.calculateStrokeDashOffset(this.values[i]));
        circle.setAttribute('transform', this.calculateTransform(i));
        circle.appendChild(title);
        title.textContent = `${this.labels[i]}: ${this.currencyFormat(val)}`;

        this.segmentElems.push(circle);
        this.svg.appendChild(circle);
    }

    updateSegments() {
        this.angleOffset = -90;
        this.chartData = [];
        this.values.forEach(this.updateSegment);
    }

    updateSegment(val, i) {
        const circle = this.segmentElems[i];
        const title = circle.querySelector('title');
        const data = {
            degrees: this.angleOffset,
        };

        this.angleOffset += this.dataPercentage(this.values[i]) * 360;
        this.chartData.push(data);

        title.textContent = `${this.labels[i]}: ${this.currencyFormat(val)}`;
        circle.setAttribute('stroke-dasharray', this.adjustedCircumference);
        circle.setAttribute('stroke-dashoffset', this.calculateStrokeDashOffset(this.values[i]));
        circle.setAttribute('transform', this.calculateTransform(i));
    }

    calculateStrokeDashOffset(val) {
        const strokeDiff = this.dataPercentage(val) * this.circumference;
        return this.circumference - strokeDiff;
    }

    /**
     * Calculates the transform rotation the circle should be
     * attributed with
     * @param {Number} i - The index of chart data to use
     * @returns {String} - The rotation of the circle
     */
    calculateTransform(i) {
        return `rotate(${this.chartData[i].degrees}, ${this.cx}, ${this.cy})`;
    }

    /**
     * Gets the percentage a given value represents of the total
     * @param {Number} val - The divisor
     * @returns {Number} - The percentage
     */
    dataPercentage(val) {
        return (this.total && val) ? val / this.total : 0;
    }

    /**
     * Destroys the segments of the circle by removing the elements,
     * removing them from the `segmentElems` array and removing their
     * data from the `segmentElems` array.
     */
    destroySegments() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
            this.segmentElems.shift();
            this.chartData.shift();
        }
        this.angleOffset = -90;
    }

    connectedCallback() {

        this.generateSegments();
        this.isLoaded = true;
    }

    /**
     * @param {string} attr - The attribute which changed
     * @param {string} oldVal - The old value
     * @param {string} newVal - The new value
     */
    attributeChangedCallback() {
        if (this.isLoaded && this.colors && this.values && this.total) {
            this.updateSegments();
        }
    }
}

if (!window.customElements.get('chart-donut')) {
    window.customElements.define('chart-donut', ChartDonut);
}
