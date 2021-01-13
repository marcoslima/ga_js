const { range } = require('../util');

const ga = {
	population: 20,
	crossover: 75,
	mutation: 20
}

exports.create_individuo = N => {
	// Genoma deve representar N inteiros.
	// Cada inteiro será representado por um byte (8 bits)
	// Então temos 8 * N bits:
	return (Array(8 * N).fill(0).map(_ => Math.random() < 0.5 ? '0' : '1')).join('')
}


exports.create_population = (population, N) => {
	return Array(population).fill(0).map(_ => exports.create_individuo(N));
}

exports.bits_to_byte = bits => {
	return bits.split("").reduce((total, value, index) => total + (value === '1' ? 2**(7-index) : 0), 0)
}

exports.decode_genes = (genes, N) => {
	return range(N).map(x => genes.slice(x*8, x*8+8)).map(bits => exports.bits_to_byte(bits))
}

exports.calc_fitness = (cities, genes, N, fn_calc_dist) => {
	const routes = exports.decode_genes(genes, N);
	return fn_calc_dist(routes, cities);
}

exports.calc_fitnesses = (cities, population, N, fn_calc_dist) => {
	return population.map(p => exports.calc_fitness(cities, p, N, fn_calc_dist));
}

exports.ga_tsp = (cities, fn_calc_dist) => {
	const N = cities.length;

	const population = exports.create_population(ga.population, N)
	console.log('População: ', population);

	const fitnesses = exports.calc_fitnesses(cities, population, N, fn_calc_dist);
	console.log('Fitnesses: ', fitnesses);
}
