mapboxgl.accessToken = 'pk.eyJ1IjoibWVvMzU3IiwiYSI6ImNtb2hpejkxMDAzamUyb29wdnFsMWU2dHUifQ._R2UlSaxpjRNccsoehAQcA'

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-74.006, 40.7128],
    zoom: 10
})

let centerData = null;

// 1. Fetch the center data
fetch('./Joined_Center_Building.geojson')
    .then(response => response.json())
    .then(data => {
        centerData = data;
    });

map.on('load', () => {
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
        id: 'community-districts-highlight',
        type: 'line',
        source: 'community-districts',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': 'white',
            'line-width': 8
        },
        filter: ['==', ['get', 'boro_cd'], '']
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

// --- THE FIXED CLICK EVENT ---
map.on('click', 'community-districts-fill', (e) => {
    const clickedDistrict = e.features[0].properties.boro_cd;
    
    // Update the Map Highlight
    map.setFilter('community-districts-highlight', ['==', ['get', 'boro_cd'], clickedDistrict]);

    map.flyTo({
        center: e.lngLat, 
        zoom: 12,        // Adjust this number for a tighter or looser zoom
        essential: true  // This ensures the animation happens even if the user has 'reduced motion' enabled
    });

    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebar-content');
    
    // Show the sidebar
    sidebar.classList.remove('hidden');

    if (centerData) {
        const filteredCenters = centerData.features.filter(feature => {
            return String(feature.properties.CD) === String(clickedDistrict);
        });

        if (filteredCenters.length > 0) {
            let html = `<h2>Community Food Connection Centers in District ${clickedDistrict}</h2>`;
            
            filteredCenters.forEach(center => {
                const props = center.properties;
                html += `
                    <div class="center-entry" style="border-bottom: 2px solid #ccc; padding: 10px 0;">
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


// --- SIDEBAR CLOSE LOGIC ---
const closeBtn = document.getElementById('close-sidebar');

if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        // 1. Stop the click from "falling through" to the map
        e.stopPropagation(); 
        
        // 2. Hide the sidebar
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('hidden');
        // Zoom back out to the full NYC view
    map.flyTo({
        center: [-74.006, 40.7128], // Original center
        zoom: 10,                   // Original zoom
        essential: true
    });
        // 3. Clear the white map highlight
        map.setFilter('community-districts-highlight', ['==', ['get', 'boro_cd'], '']);
    });
}

// Hover effects
map.on('mouseenter', 'community-districts-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
map.on('mouseleave', 'community-districts-fill', () => { map.getCanvas().style.cursor = ''; });