mapboxgl.accessToken = 'pk.eyJ1IjoibWVvMzU3IiwiYSI6ImNtb2hpejkxMDAzamUyb29wdnFsMWU2dHUifQ._R2UlSaxpjRNccsoehAQcA'

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-74.006, 40.7128],
    zoom: 10
})

map.on('load', () => {
    // 1. Add the community district source and layers
    map.addSource('community-districts', {
        type: 'geojson',
        data: './simplified-community-districts.json'
    });

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

    // 2. Add the polygon source and layers for center fills/outlines
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

    map.addLayer({
        id: 'centers-outline',
        type: 'line',
        source: 'centers-polygons',
        paint: {
            'line-color': 'yellow',
            'line-width': 2,
            'line-opacity': 1
        }
    });

    // 3. Add the points source and circle layer for center markers
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
    // 1. Get the boro_cd of the clicked district
    const clickedDistrict = e.features[0].properties.boro_cd;
    
    // 2. Query all features from the food centers source
    // Note: boro_cd is often a string ("103"), while CD might be a number (103)
    const allCenters = map.querySourceFeatures('centers-polygons');
    
    // 3. Filter centers where CD matches the clicked district ID
    const filteredCenters = allCenters.filter(feature => {
        return feature.properties.CD == clickedDistrict;
    });

    const sidebarContent = document.getElementById('sidebar-content');

    if (filteredCenters.length > 0) {
        // 4. Create the HTML for the sidebar
        let html = `<h2>Community Food Connection Centers in Community District ${clickedDistrict}</h2>`;
        
        filteredCenters.forEach(center => {
            const props = center.properties;
            html += `
                <div class="center-entry">
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
        sidebarContent.innerHTML = `
            <h2>Community Food Connection Centers in Community District ${clickedDistrict}</h2>
            <p>No Community Food Connection centers found in this district.</p>
        `;
    }
});

// Change cursor to pointer when hovering over districts
map.on('mouseenter', 'community-districts-fill', () => {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'community-districts-fill', () => {
    map.getCanvas().style.cursor = '';
});