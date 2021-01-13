exports.distance = (city1, city2) => {
	if (city1 === undefined || city2 === undefined)
		return 1e20;
	else
		return Math.sqrt((city1.x - city2.x)**2 + (city1.y - city2.y)**2);
}

exports.calc_route_distance = (route, cities) => {
	return route.reduce((total, value, index) => {
		return index === 0 ? 0 : total + exports.distance(cities[route[index-1]], cities[value])
	});
}
