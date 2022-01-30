// import { registerComponents  } from '../../common/register-components';

/**
 * @injectHTML
 */
export class ChartDonut extends HTMLElement {
    static get observedAttributes() {
        return [
            'colors',
            'values',
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

        this.svg = this.shadowRoot.querySelector('svg');
        this.generateSegment = this.generateSegment.bind(this);
    }

    set colors(v) {
        this.setAttribute('colors', JSON.stringify(v));
    }

    get colors() {
        let colors = this.getAttribute('colors');

        // Replace single quotes with double-quotes
        colors = colors.replace(/'/g, '"');

        return colors ? JSON.parse(colors) : [];
    }

    set values(v) {
        this.setAttribute('values', JSON.stringify(v));
    }

    get values() {
        let values = this.getAttribute('values') || '';

        values = values.replace(/'/g, '"');

        // console.log(values);

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

    generateSegments() {

        this.values.forEach(this.generateSegment);
        console.log(this.segmentElems);
    }

    generateSegment(val, i) {
        // console.log(val, i);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const data = {
            degrees: this.angleOffset,
        };

        console.log('degrees:', this.angleOffset);

        // console.log('calculated offset:', this.values[i], this.dataPercentage(this.values[i]) * 360)
        this.angleOffset += this.dataPercentage(this.values[i]) * 360;
        this.chartData.push(data);

        // console.log(this.values[i], this.dataPercentage(this.values[i]),  this.angleOffset);

        circle.setAttribute('cx', this.cx);
        circle.setAttribute('cy', this.cy);
        circle.setAttribute('r', this.radius);
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', this.colors[i]);
        circle.setAttribute('stroke-width', 30);
        circle.setAttribute('stroke-dasharray', this.adjustedCircumference);
        circle.setAttribute('stroke-dashoffset', this.calculateStrokeDashOffset(this.values[i]));
        circle.setAttribute('transform', this.calculateTransform(i));


        this.segmentElems.push(circle);
        this.svg.appendChild(circle);

    }

    updateSegment(segment) {

    }

    calculateStrokeDashOffset(val) {
        const strokeDiff = this.dataPercentage(val) * this.circumference;
        return this.circumference - strokeDiff;
    }

    calculateTransform(i) {
        return `rotate(${this.chartData[i].degrees}, ${this.cx}, ${this.cy})`;
    }

    dataPercentage(val) {
        return this.total ? val / this.total : 0;
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if (this.colors && this.values && this.total) {
            this.destroySegments();
            this.generateSegments();
            console.log(this.data)
        }
    }

    destroySegments() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
            this.segmentElems.shift();
            this.chartData.shift();
        }
        this.angleOffset = -90;
    }
}

if (!window.customElements.get('chart-donut')) {
    window.customElements.define('chart-donut', ChartDonut);
}
