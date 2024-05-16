
const raster = new ol.layer.Tile({
    source: new ol.source.OSM(),
});

const format = new ol.format.WKT();
const feature = format.readFeature(
    'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
    '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
    '-39.1552734375, 10.689697265625 -25.0927734375))',
);
feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

const vector = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [feature],
    }),
    opacity: 0.5,
});

const map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: new ol.View({
        center: [0, 0],
        zoom: 2,
    }),
});
var scaleLine = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 6,
    text: true,
    minWidth: 140,
    target: 'scale_bar'
});
map.addControl(scaleLine);

// Define the drag zoom interaction
const zoomininteraction = new ol.interaction.DragBox();

zoomininteraction.on('boxend', function () {
    // Get the extent of the drawn box
    const zoominExtent = zoomininteraction.getGeometry().getExtent();
    map.getView().fit(zoominExtent);
});

const mapElement = document.getElementById("map");


function resetCursor() {
    mapElement.style.cursor = "auto"; // Reset cursor to normal
    map.removeInteraction(zoomininteraction);
}

// // Add event listener for "zoomend" event
map.on('moveend', resetCursor);

// // Append the button element to the document body
document.body.appendChild(ziButton);

// Button click event listener for activating/deactivating drag zoom interaction
ziButton.addEventListener('click', () => {
    mapElement.style.cursor = "zoom-in";
    map.addInteraction(zoomininteraction);
})
const dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148],
};

const exportButton = document.getElementById('export-pdf');
// const scaleSelect = document.getElementById('scale'); // Define scaleSelect here


exportButton.addEventListener(
    'click',
    function () {
        exportButton.disabled = true;
        document.body.style.cursor = 'progress';

        const format = document.getElementById('format').value;
        const resolution = document.getElementById('resolution').value;
        const dim = dims[format];
        const width = Math.round((dim[0] * resolution) / 25.4);
        const height = Math.round((dim[1] * resolution) / 25.4);
        const size = map.getSize();
        const viewResolution = map.getView().getResolution();
    
        map.once('rendercomplete', function () {
            const mapCanvas = document.createElement('canvas');
            mapCanvas.width = width;
            mapCanvas.height = height;
            const mapContext = mapCanvas.getContext('2d');
            Array.prototype.forEach.call(
                document.querySelectorAll('.ol-layer canvas'),
                function (canvas) {
                    if (canvas.width > 0) {
                        const opacity = canvas.parentNode.style.opacity;
                        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                        const transform = canvas.style.transform;
                        // Get the transform parameters from the style's transform matrix
                        const matrix = transform
                            .match(/^matrix\(([^\(]*)\)$/)[1]
                            .split(',')
                            .map(Number);
                        // Apply the transform to the export map context
                        CanvasRenderingContext2D.prototype.setTransform.apply(
                            mapContext,
                            matrix,
                        );
                        mapContext.drawImage(canvas, 0, 0);
                    }
                },
            );
            mapContext.globalAlpha = 1;
            mapContext.setTransform(1, 0, 0, 1, 0, 0);
            const pdf = new jspdf.jsPDF('landscape', undefined, format);
            pdf.addImage(
                mapCanvas.toDataURL('image/jpeg'),
                'JPEG',
                0,
                0,
                dim[0],
                dim[1],
            );
            pdf.save('map.pdf');
            // Reset original map size
            map.setSize(size);

            map.getView().setResolution(viewResolution);
            exportButton.disabled = false;
            document.body.style.cursor = 'auto';
        });

        // Set print size
        const printSize = [width, height];
        map.setSize(printSize);
        const scaling = Math.min(width / size[0], height / size[1]);
        map.getView().setResolution(viewResolution / scaling);
    },
);





