/**
 * @module
 * @author Ophir LOJKINE
 * salesman npm module
 *
 * Good heuristic for the traveling salesman problem using simulated annealing.
 * @see {@link https://lovasoa.github.io/salesman.js/|demo}
 **/


class Path {
  /**
   * @private
   */
  constructor(points) {
    let i;
    this.points = points;
    this.order = new Array(points.length);
    for(i = 0; i<points.length; i++) this.order[i] = i;
    this.distances = new Array(points.length * points.length);
    for(i = 0; i<points.length; i++)
      for(let j=0; j<points.length; j++)
        this.distances[j + i*points.length] = distance(points[i], points[j]);
  }

  change(temp) {
    const i = this.randomPos(), j = this.randomPos();
    const delta = this.delta_distance(i, j);
    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      this.swap(i,j);
    }
  }

  swap(i, j) {
    [this.order[i], this.order[j]] = [this.order[j], this.order[i]]
  }

  delta_distance(i, j) {
    const jm1 = this.index(j - 1),
      jp1 = this.index(j + 1),
      im1 = this.index(i - 1),
      ip1 = this.index(i + 1);
    let s =
      this.distance(jm1, i)
      + this.distance(i, jp1)
      + this.distance(im1, j)
      + this.distance(j, ip1)
      - this.distance(im1, i)
      - this.distance(i, ip1)
      - this.distance(jm1, j)
      - this.distance(j, jp1);
    if (jm1 === i || jp1 === i)
      s += 2*this.distance(i,j);
    return s;
  }

  index(i) {
    return (i + this.points.length) % this.points.length;
  }

  access(i) {
    return this.points[this.order[this.index(i)]];
  }

  distance(i, j) {
    return this.distances[this.order[i] * this.points.length + this.order[j]];
  }

// Random index between 1 and the last position in the array of points
  randomPos() {
    return 1 + Math.floor(Math.random() * (this.points.length - 1));
  }
}

/**
 * Solves the following problem:
 *  Given a list of points and the distances between each pair of points,
 *  what is the shortest possible route that visits each point exactly
 *  once and returns to the origin point?
 *
 * @param {Point[]} points The points that the path will have to visit.
 * @param {Number} [temp_coeff=0.999] changes the convergence speed of the algorithm: the closer to 1, the slower the algorithm and the better the solutions.
 * @param {Function} [callback=] An optional callback to be called after each iteration.
 *
 * @returns {Number[]} An array of indexes in the original array. Indicates in which order the different points are visited.
 *
 * @example
 * var points = [
 *       new salesman.Point(2,3)
 *       //other points
 *     ];
 * var solution = salesman.solve(points);
 * var ordered_points = solution.map(i => points[i]);
 * // ordered_points now contains the points, in the order they ought to be visited.
 **/
function solve(points, temp_coeff, callback) {
  const path = new exports.Path(points);
  if (points.length < 2) return path.order; // There is nothing to optimize
  if (!temp_coeff)
    temp_coeff = 1 - Math.exp(-10 - Math.min(points.length,1e6)/1e5);
  const has_callback = typeof (callback) === "function";

  for (let temperature = 100 * distance(path.access(0), path.access(1));
       temperature > 1e-6;
       temperature *= temp_coeff) {
    path.change(temperature);
    if (has_callback) callback(path.order);
  }
  return path.order;
}

/**
 * Represents a point in two dimensions.
 * @class
 * @param {Number} x abscissa
 * @param {Number} y ordinate
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
}

function distance(p, q) {
  const dx = p.x - q.x, dy = p.y - q.y;
  return Math.sqrt(dx*dx + dy*dy);
}

if (typeof module === "object") {
  module.exports = {
    "solve": solve,
    "Point": Point,
  };
}


////////////////////////////////////////////////////////
describe("Salesman's internal tests", () =>
{
  test('Point is a point', () => {
      const point = new Point(42, 17);
      expect(point.x).toBe(42);
      expect(point.y).toBe(17);
  })

  test('Distance', () => {
      const p1 = new Point(0, 0);
      const p2 = new Point(1, 1);
      const p3 = new Point(1, 0);

      expect(distance(p1, p2)).toBe(Math.sqrt(2));
      expect(distance(p1, p3)).toBe(1);
      expect(distance(p2, p3)).toBe(1);
  })

  describe('Path method tests', () => {
    test('swap', () => {
      const path = new Path([]);
      path.order = [42, 17];
      expect(path.order[0]).toBe(42);
      expect(path.order[1]).toBe(17);
      path.swap(0, 1);
      expect(path.order[0]).toBe(17);
      expect(path.order[1]).toBe(42);

    })
  })
})
