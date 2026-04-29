mapboxgl.accessToken = 'pk.eyJ1IjoibWVvMzU3IiwiYSI6ImNtb2hpejkxMDAzamUyb29wdnFsMWU2dHUifQ._R2UlSaxpjRNccsoehAQcA'

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-74.006, 40.7128],
    zoom: 10
})

// We'll store the center data here so the click listener can always find it
let centerData = null;

// 1. Fetch the center data immediately
fetch('./Joined_Center_Building.geojson')
    .then(response => response.json())
    .then(data => {
        centerData = data;
    });

map.on('load', () => {
    // Community Districts Source
    map.addSource('community-districts', {
        type: 'geojson',
        data: './simplified-community-districts.json'
    });

    // Fill Layer
    map.addLayer({
        id: 'community-districts-fill',
        type: 'fill',
        source: 'community-districts',
        paint: {
            'fill-color': [
                'match',
                ['slice', ['get', 'boro_cd'], 0, 1],
                '1', '#8c56e2',
                '2', '#863e3e',
                '3', '#73e8c7',
                '4', '#44aae1',
                '5', '#7d7e52',
                '#1e293b'
            ],
            'fill-opacity': 0.3
        }
    });

    // Thick White Border Layer (Starts invisible)
    map.addLayer({
        id: 'community-districts-highlight',
        type: 'line',
        source: 'community-districts',
        layout: {
        // This makes the individual dashes rounded at the ends
        'line-cap': 'round',
        'line-join': 'round'
    },
        paint: {
            'line-color': 'white',
            'line-width': 8
        },
        filter: ['==', ['get', 'boro_cd'], '']
    });

    // Standard Border Layer
    map.addLayer({
        id: 'community-districts-border',
        type: 'line',
        source: 'community-districts',
        paint: {
            'line-color': '#074580',
            'line-width': 1,
            'line-opacity': 0.8
        }
    });

    // Centers Polygons
    map.addSource('centers-polygons', {
        type: 'geojson',
        data: 'Joined_Center_Building.geojson'
    });

    map.addLayer({
        id: 'centers-fill',
        type: 'fill',
        source: 'centers-polygons',
        paint: {
            'fill-color': 'yellow',
            'fill-opacity': 0.8
        }
    });

    // Centers Points
    map.addSource('centers-points', {
        type: 'geojson',
        data: 'CFC_ACTIVE_points.geojson'
    });

    map.addLayer({
        id: 'centers-layer',
        type: 'circle',
        source: 'centers-points',
        paint: {
            'circle-radius': 2.5,
            'circle-color': 'yellow',
        }
    });
});

map.on('click', 'community-districts-fill', (e) => {
    const clickedDistrict = e.features[0].properties.boro_cd;
    
    // Update the White Border
    map.setFilter('community-districts-highlight', ['==', ['get', 'boro_cd'], clickedDistrict]);

    const sidebarContent = document.getElementById('sidebar-content');

    // Filter centers using the pre-loaded centerData
    if (centerData) {
        const filteredCenters = centerData.features.filter(feature => {
            // Ensure comparison works whether CD is a string or number
            return String(feature.properties.CD) === String(clickedDistrict);
        });

        if (filteredCenters.length > 0) {
            let html = `<h2>Community Food Connection Centers in District ${clickedDistrict}</h2>`;
            
            filteredCenters.forEach(center => {
                const props = center.properties;
                html += `
                    <div class="center-entry" style="border-bottom: 5px solid #ccc; padding: 10px 0;">
                        <h3>${props.Center || 'Unknown Center'}</h3>
                        <p><strong>Address:</strong> ${props.Address_2 || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${props.Phone || 'N/A'}</p>
                        <p><strong>Days:</strong> ${props.Days || 'N/A'}</p>
                        <p><strong>Hours:</strong> ${props.Hours || 'N/A'}</p>
                    </div>
                `;
            });
            sidebarContent.innerHTML = html;
        } else {
            sidebarContent.innerHTML = `<h2>District ${clickedDistrict}</h2><p>No centers found in this district.</p>`;
        }
    }
});

map.on('mouseenter', 'community-districts-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
map.on('mouseleave', 'community-districts-fill', () => { map.getCanvas().style.cursor = ''; });