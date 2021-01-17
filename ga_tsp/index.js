const { range } = require('../util');

const ga = {
	population: 90,
	crossover: .75,
	mutation: .20
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
	return range(N).map(x => genes.slice(x*8, x*8+8)).map(bits => Math.floor((N-1)*(exports.bits_to_byte(bits)/255)))
}

exports.calc_fitness = (cities, genes, N, fn_calc_dist) => {
	const routes = exports.decode_genes(genes, N);
	return fn_calc_dist(routes, cities);
}

exports.calc_fitnesses = (cities, population, N, fn_calc_dist) => {
	return population.map(p => exports.calc_fitness(cities, p, N, fn_calc_dist));
}

exports.order_pop = (population, fitnesses) => {
	return population
		.map((e, i) => ({indiv: e, fitness: fitnesses[i]}))
		.sort((left, right) => left.fitness - right.fitness)
		.map(e => e.indiv);
};

exports.select = (ordered, roleta) => {
	const pos = Math.floor((Math.random() * roleta.length));
	return ordered[roleta[pos]]
};

exports.make_roleta = function (N) {
	return Array(N)
		.fill(0)
		.map((_, i) => Array(N-i).fill(i))
		.flat();
};

exports.do_crossover = (indiv1, indiv2, crossover_chance) => {
	if(Math.random() > crossover_chance) {
		return [indiv1, indiv2]
	}

	const pos = Math.floor(Math.random() * indiv1.length);
	const filho1 = indiv1.slice(0, pos) + indiv2.slice(pos);
	const filho2 = indiv2.slice(0, pos) + indiv1.slice(pos);

	return [filho1, filho2];
};

exports.mutate = (original, position) => (
	original.slice(0, position) + (original[position] === '1' ? '0' : '1') + original.slice(position+1)
)

exports.do_mutation = (filhos, mutation_chance) => {
	if(Math.random() > mutation_chance) {
		return filhos;
	}

	const mutation_pos1 = Math.floor(Math.random() * filhos[0].length);
	const mutation_pos2 = Math.floor(Math.random() * filhos[1].length);

	const mutated1 = exports.mutate(filhos[0], mutation_pos1);
	const mutated2 = exports.mutate(filhos[1], mutation_pos2);

	return [mutated1, mutated2];
};

exports.ga_tsp = (cities, fn_calc_dist) => {
	const N = cities.length;

	let population = exports.create_population(ga.population, N)
	// console.log('População: ', population);

	let delta = 0;
	let last_best = 0;
	let count = 0;
	const roleta = exports.make_roleta(ga.population);


	while(true) {
		const fitnesses = exports.calc_fitnesses(cities, population, N, fn_calc_dist);
		const ordered = exports.order_pop(population, fitnesses);
		const ordered_fitnesses = fitnesses.sort();

		if(last_best === 0) {
			console.log('Inicializando last_best com ', ordered_fitnesses[0])
			last_best = ordered_fitnesses[0];
		}
		else if(count === 10000){
			count = 0;
			delta = last_best - ordered_fitnesses[0]
			last_best = ordered_fitnesses[0]

			if(delta < 0.1) {
				console.log('Delta menor, saindo: ', delta);
				break;
			}
			console.log('Last Best: ', last_best)
		}
		count++;

		const new_population = Array();

		// Elitismo: 2 melhores
		new_population.push(ordered[0]);
		new_population.push(ordered[1]);

		while (new_population.length < ga.population) {
			const indiv1 = exports.select(ordered, roleta);
			const indiv2 = exports.select(ordered, roleta);

			const filhos = exports.do_crossover(indiv1, indiv2, ga.crossover);
			const mutateds = exports.do_mutation(filhos, ga.mutation);
			new_population.push(mutateds[0]);
			new_population.push(mutateds[1]);
		}

		population = new_population;
	}

}


/*

População:  [
  '0100001110011110000010101000000010101110100101110110011111100000010000101000010001110',
  '0010101011110001000010000001011110000100101010001101000101101001000100010100110111101',
  '0011010001110000100100101100100011011100010101001011110110110110001011010010000001011',
  '1000010111101101001000100110000010001000101100111010010011001100110000000011101001101',
  '1011011000011000001000100001001010111011011100110110001110010101001011000100011110101',
  '0101110110010010001010001001100000011111110110011110001000100110100000000001110000010',
  '0011110101011001010000110011001100010010101110101100010101001111000010001010011001101',
  '0110111001000011110111010101001100000011001110011001110101100011111111010011001001001',
  '1010110100100011101010111111000100001101001111110000001000101111001011101110011000001',
  '1000100001110011000101101111000110110110011001001111110100100100000111001001110111111',
  '1110100000010011011110110010110111101100111010000000001111001100101001000000110000101',
  '0100111100011101111011111101001111011010000010111101011100010000001001010001010110110',
  '0110100111011101011010001001011001101011110011101010100001000101100000010010110011001',
  '1010001101000011100111100011011011000000000011101000111000001001110000111110110100101',
  '1010101111010111001010101100001010100011110110001101010100101100110110001000100001101',
  '0100010111011001111101010011110100110100110011101000111100011010001001010100110101100',
  '1110000000101010011001101011000000100010011100001100001111101000110000001000010101000',
  '0000110010010111001101010000001100000110110110010111000011000110000010011010000001011',
  '0100100100110111101101000101111000101001111110110000010011010101011110100111101011000',
  '1001101000001100111010010010100110001110010100001110101100101101000010110010000001000'


1110100000010011011110110010110111101100111010000000001111001100101001000000110000101
0011110101011001010000110011001100010010101110101100010101001111000010001010011001101

1110100000010011011110110010110111101100111010000000000101001111000010001010011001101
0011110101011001010000110011001100010010101110101100011111001100101001000000110000101


1110100000010011011110110011110111101100111010000000000101001111000010001010011001101
0011110101011001010000110011001100010010101110101100011111001100101001000000110000101
* */


