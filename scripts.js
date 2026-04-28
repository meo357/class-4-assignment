mapboxgl.accessToken = 'pk.eyJ1IjoibWVvMzU3IiwiYSI6ImNtb2hpejkxMDAzamUyb29wdnFsMWU2dHUifQ._R2UlSaxpjRNccsoehAQcA'

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-74.006, 40.7128],
    zoom:10
})


map.on('load', () => {
    // 1. Add the data source
    map.addSource('community-districts', {
        type: 'geojson',
        data: './simplified-community-districts.json'
    });

    // 2. Add the visual layer
map.addLayer({
    'id': 'community-districts-fill',
    'type': 'fill',
    'source': 'community-districts',
    'slot': 'middle',
    'paint': {
        'fill-color': [
            'match',
            ['slice', ['get', 'boro_cd'], 0, 1],
            '1', '#8c56e2', // Deep Slate (Manhattan) - Neutral anchor
            '2', '#863e3e', // Muted Crimson (Bronx) - Warm but dark
            '3', '#73e8c7', // Deep Forest Green (Brooklyn) - Rich contrast for yellow
            '4', '#44aae1', // Midnight Blue (Queens) - Perfect dark backdrop
            '5', '#7d7e52', // Deep Royal Purple (Staten Island) - High "pop" contrast
            '#1e293b'      // Dark default
        ],
        'fill-opacity': 0.3 // Slightly higher opacity to show the richer colors
    }
});
    // 3. Addition of community district boundaries
    map.addLayer({
    'id': 'community-districts-border',
    'type': 'line',
    'source': 'community-districts',
    'slot': 'middle', // Keeps it organized with the fill layer
    'paint': {
        'line-color': '#074580', // Blue borders
        'line-width': 1,         // Adjust thickness as needed
        'line-opacity': 0.8
    }
});
});

map.on('load', () => {
    map.addSource('centers', {
        type: 'geojson',
        data: 'CFC_ACTIVE_points.geojson' // Path to your file
    });

    map.addLayer({
        id: 'centers-layer',
        type: 'circle',
        source: 'centers',
        paint: {
            'circle-radius': 2.5,
            'circle-color': 'yellow' // Yellow color
        }
    });
});