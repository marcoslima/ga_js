const { solve, Point } = require('./salesman');
const { ga_tsp } = require('./ga_tsp');
const { calc_route_distance } = require('./cities');
const { range }  = require("./util");


/*
O que vamos resolver? Problema do caixeiro viajante.

Dadas N cidades qual o roteiro mais curto para o caixeiro visitar todas as cidades passando apenas 1 vez por cada uma?
*/

const config = {
	min_coord: 0,
	max_coord: 1000,
	num_cities: 100
};


function Rand(min_or_max_n, max_n) {
	const min_v = max_n === undefined ? 0 : min_or_max_n;
	const max_v = max_n === undefined ? min_or_max_n : max_n;
	const delta = max_v - min_v;
	return min_v + (Math.random() * delta);
}

function create_city() {
	const {min_coord, max_coord} = config;

	return {
		x: Rand(min_coord, max_coord),
		y: Rand(min_coord, max_coord)
	}
}

function create_cities(N) {
	return Array(N).fill(0).map(() => create_city());
}

function shuffle(arr) {
	return arr.sort(() => Math.random() - 0.5);
}

function make_random_route(N) {
	return shuffle(range(N));
}


function main() {
	const cities = create_cities(config.num_cities);

	// Random route solution
	const route = make_random_route(config.num_cities);
	const distance = calc_route_distance(route, cities);

	console.log('=========================================');
	console.log('Cities: ', cities);
	console.log('Random Route: ', route);
	console.log('Distance: ', distance);

	// Lib solution
	const solution = solve(cities.map(c => new Point(c.x, c.y)));
	const sol_dist = calc_route_distance(solution, cities);

	console.log('=========================================');
	console.log('Salesman lib solution:');
	console.log('Route: ', solution);
	console.log('Distance: ', sol_dist);


	// GA solution:
	const ga_sol = ga_tsp(cities, calc_route_distance);
	console.log('ga_sol: ', ga_sol);
}

main();
