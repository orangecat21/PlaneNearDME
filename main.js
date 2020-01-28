const tableContainer = document.querySelector('.table-wrap');

class TableRenderer {
	fetch() {
		fetch('https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48')
			.then((response) => {
				if (response.status !== 200) {
					console.error(response.status + ': ' + response.statusText);
					return;
				}
				response.json()
					.then(data => renderTable(data))
					.then(setTimeout(()=>this.fetch(),3000))
			})
			.catch((error) => {
				console.error('error', error);
				setTimeout(() => this.fetch(), 5000);
			})
	}
}

const tableHeader = `<table>
						<tr>
							<th>Latitude</th>
							<th>Longitude</th>
							<th>Speed (km/h)</th>
							<th>Сourse (deg)</th>
							<th>Height of flight (m)</th>
							<th>Departure</th>
							<th>Arrival</th>
							<th>Numder of flight</th>
						</tr>
					</table>`;

function renderTableRow(rowData) {
	let [latitude, longitude, speed, course, height, departure, arrival, flightNum] = rowData;
	const row = document.createElement('tr');
	row.innerHTML = `<td>${latitude}</td><td>${longitude}</td><td>${speed}</td><td>${course}</td><td>${height}</td><td>${departure}</td><td>${arrival}</td><td>${flightNum}</td>`;
	height === 'Plane landed' && row.classList.add('ground');
	return row;
};

function distToAirport(plane) {
	let latitude = plane[1] * Math.PI / 180;
	let longitude = plane[2] * Math.PI / 180;
	const airportLat = 55.41;
	const airportLong = 37.902;
	const R_EARTH = 6371;
	return Math.acos(Math.sin(latitude) * Math.sin(airportLat * Math.PI / 180) + Math.cos(latitude) * Math.cos(airportLat * Math.PI / 180) * Math.cos(longitude - airportLong * Math.PI / 180)) * R_EARTH;
};

function renderTable(planeData) {
	tableContainer.classList.remove('loading');
	tableContainer.innerHTML = tableHeader;
	const table = document.querySelector('table');
	let planes = Object.values(planeData).sort((first, second) => distToAirport(first) - distToAirport(second));
	for (let plane of planes) {
		if (typeof plane[1] !== 'undefined') {
			let rowData = [plane[1], plane[2], Math.round(plane[5] * 1.852), plane[3], Math.round(plane[4] * 0.3048) || 'Plane landed', plane[11] || `N/A`, plane[12] || `N/A`, plane[13] || `N/A`];
			table.appendChild(renderTableRow(rowData));
		}
	}
};
const planeTable = new TableRenderer;
planeTable.fetch();