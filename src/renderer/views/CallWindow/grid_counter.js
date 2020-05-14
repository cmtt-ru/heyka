/* eslint-disable no-magic-numbers */

//! http://blog.kislenko.net/show.php?id=1865
//! В будущем можно будет поменять алгоритм на тот, который выше, в нём О(N^3)

import { appendFileSync } from 'fs';

const ASPECT_RATIO = 124 / 168;
const SMALL_DIFF = 0.9;
const GOLDEN_RATIO = 1.62;
const MAX_USERS = 32;

const countHash = (arr) => {
  let hash = 0;

  for (let i = 0; i < arr.length; i++) {
    hash += arr[i] ** 2;
  }

  return hash;
};

const prettyTower = (arr) => {
  const res = [];
  let counter = (1 / arr[0]);

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      counter += (1 / arr[i]);
    } else {
      res.push(counter);
      counter = (1 / arr[i]);
    }
  }
  res.push(counter);
  if (res.length === 1) {
    return res[0] * ASPECT_RATIO;
  }

  for (let pos = 0; pos < res.length; pos++) {
    if (res[pos] * ASPECT_RATIO > GOLDEN_RATIO) {
      return false;
    }
  }

  return res.reduce((a, b) => a + b) * ASPECT_RATIO;
};

const countUglyness = (arr) => {
  let ugly = 0;

  if (arr.length === 1) {
    return 0;
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] != arr[i - 1]) {
      ugly += 10;
      ugly += (arr[i] / arr[i - 1]);
    }
  }

  return ugly;
};

const spreadedGrid = (arr) => {
  const res = [];

  for (const el of arr) {
    for (let i = 0; i < el; i++) {
      res.push(1 / el);
    }
  }

  return res;
};

const countLayouts = (people) => {
  const grids = [];
  const hashArray = [];

  for (let i = 0; i < 2 ** (people - 1); i++) {
    const variant = [];
    const binary = i.toString(2).padStart(people - 1, '0');
    let counter = 1;

    for (let pos = 0; pos < people - 1; pos++) {
      if (binary[pos] === '1') {
        counter++;
      } else {
        variant.push(counter);
        counter = 1;
      }
    }
    variant.push(counter);
    variant.sort((a, b) => a - b);
    if (variant[0] * 2 >= variant[variant.length - 1]) {
      const ratio = prettyTower(variant);

      if (ratio) {
        const hash = countHash(variant);

        if (!hashArray.includes(hash)) {
          hashArray.push(hash);
          grids.push({
            ratio,
            sizes: variant,
            spreadedSizes: spreadedGrid(variant),
            uglyness: countUglyness(variant),
          });
        }
      }
    }
  }
  grids.sort((a, b) => a.ratio - b.ratio);
  for (let i = 1; i < grids.length; i++) {
    if (grids[i - 1].ratio / grids[i].ratio > SMALL_DIFF) {
      if (grids[i].uglyness > grids[i - 1].uglyness) {
        grids.splice(i, 1);
        i -= 1;
      } else {
        grids.splice(i - 1, 1);
        i -= 1;
      }
    }
  }
  output(people, grids.map(el => {
    return {
      ratio: el.ratio,
      sizes: el.spreadedSizes,
    };
  }));
};

const output = (people, grids) => {
  appendFileSync('output.txt', people + ':' + JSON.stringify(grids) + ',\n', function (err) {
    if (err) {
      return console.log(err);
    }
  });
};

appendFileSync('output.txt', 'const GRIDS = {');
for (let people = 1; people <= MAX_USERS; people++) {
  countLayouts(people);
  console.log(people);
}

appendFileSync('output.txt', '}');