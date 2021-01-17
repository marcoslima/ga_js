const ga_tsp = require('../ga_tsp');
const { calc_route_distance } = require('../cities');


function make_mock_cities() {
  return [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 }
  ];
}

describe('bits_to_byte', () => {
  test('0', () => {
    expect(ga_tsp.bits_to_byte('00000000')).toBe(0);
  });

  test('1', () => {
    expect(ga_tsp.bits_to_byte('00000001')).toBe(1);
  });

  test('2', () => {
    expect(ga_tsp.bits_to_byte('00000010')).toBe(2);
  });

  test('255', () => {
    expect(ga_tsp.bits_to_byte('11111111')).toBe(255);
  });

  test('7', () => {
    expect(ga_tsp.bits_to_byte('00000111')).toBe(7);
  });

});

describe('decode_genes', () => {
  test('123', () => {
    const result = ga_tsp.decode_genes('000000010000001000000011', 3);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('create_individuo', () => {
  test('create_individuo 8bits', () => {
    const ind1 = ga_tsp.create_individuo(1);
    expect(ind1.length).toBe(8);
  });

  test('create_individuo 32bits', () => {
    const ind1 = ga_tsp.create_individuo(4);
    expect(ind1.length).toBe(32);
  });
});

test('Create Population', () => {
  const popul = ga_tsp.create_population(3, 1);
  expect(popul.length).toBe(3);
  expect(popul[0].length).toBe(8);
});

test('Cald Route Distance', () => {
  const mock_cities = make_mock_cities();
  const mock_route = [0, 1, 2];
  const distance = calc_route_distance(mock_route, mock_cities);

  expect(distance).toBe(20);
});

test('Calc Fitness', () => {
  const mock_cities = make_mock_cities();
  const genes = '000000000000000100000010';
  const routes = ga_tsp.decode_genes(genes, 3);
  expect(routes).toEqual([0, 1, 2]);
  const fitness = ga_tsp.calc_fitness(mock_cities, genes, 3, calc_route_distance);

  expect(fitness).toBe(20);
});


test('Calc Fitness retorna 1e20 se index error', () => {
  const mock_cities = make_mock_cities();
  const genes = '00000000000000010000001000000011';
  const routes = ga_tsp.decode_genes(genes, 4);
  expect(routes).toEqual([0, 1, 2, 3]);
  const fitness = ga_tsp.calc_fitness(mock_cities, genes, 4, calc_route_distance);

  expect(fitness).toBe(1e20 + 20);
});


test('Calc Fitinesses', () => {
  jest.spyOn(ga_tsp, 'calc_fitness');
  ga_tsp.calc_fitness.mockImplementationOnce((cities, genes, N, fn_calc_dist) => 1);
  ga_tsp.calc_fitness.mockImplementationOnce((cities, genes, N, fn_calc_dist) => 2);
  ga_tsp.calc_fitness.mockImplementationOnce((cities, genes, N, fn_calc_dist) => 3);


  const mock_cities = jest.fn().mockName('cities');
  const mock_N = jest.fn().mockName('N');
  const mock_fn_calc_dist = jest.fn().mockName('fn_calc_dist');

  const mock_population = ['p1', 'p2', 'p3'];

  const result = ga_tsp.calc_fitnesses(mock_cities, mock_population, mock_N, mock_fn_calc_dist);

  expect(result).toEqual([1, 2, 3]);

});

test('Ordenação da população de acordo com fitness', () => {
  const mock_population = [1, 2, 3, 4, 5];
  const mock_fitnesses = [5, 4, 3, 2, 1];

  const result = ga_tsp.order_pop(mock_population, mock_fitnesses);

  expect(result).toEqual([5, 4, 3, 2, 1]);
})

test('Make Roleta faz array com os elementos ordenados', () =>{
  const mock_N = 6;
  const result = ga_tsp.make_roleta(mock_N);
  const expected = [0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,3,3,3,4,4,5];
  expect(result).toEqual(expected);
})

describe('Mutation tests', () => {
  test('mutate funciona', () => {
    const mock_original = '00000000';
    const mock_pos = 4;

    const result = ga_tsp.mutate(mock_original, mock_pos);

    expect(result).toBe('00001000');
  });

  test('mutate não quebra com última posição', () => {
    const mock_original = '00000000';
    const mock_pos = 7;

    const result = ga_tsp.mutate(mock_original, mock_pos);

    expect(result).toBe('00000001');
  });

  test('do_mutation decide não fazer mutação', () => {
    jest.spyOn(Math, 'random');
    Math.random.mockImplementationOnce(() => 0.7);
    const mock_filhos = ['00000000', '00000001'];

    const result = ga_tsp.do_mutation(mock_filhos, 0.5);

    expect(result).toEqual(mock_filhos);
  })

  test('do_mutation faz mutaçoes', () => {
    jest.spyOn(Math, 'random');
    Math.random.mockImplementationOnce(() => 0.3);
    Math.random.mockImplementationOnce(() => 0.5);
    Math.random.mockImplementationOnce(() => 0.8);

    const mock_filhos = ['0000000000', '0000000001'];
    const expected =    ['0000010000', '0000000011'];

    const result = ga_tsp.do_mutation(mock_filhos, 0.5);

    expect(result).toEqual(expected);
  })
})
