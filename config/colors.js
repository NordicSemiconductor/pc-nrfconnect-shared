/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
const flattenedColors = require('../src/utils/colors').colors;

const paletteColorsKeys = [
    'nordicBlue',
    'gray',
    'red',
    'indigo',
    'amber',
    'purple',
    'green',
    'deepPurple',
    'orange',
    'lime',
    'lightGreen',
    'lightBlue',
    'pink',
];

const paletteColors = {};

paletteColorsKeys.forEach(color => {
    const colorList = Object.entries(flattenedColors)
        .filter(([key]) => key.startsWith(color))
        .map(([key, value]) => {
            if (key === color) {
                return ['DEFAULT', value];
            }
            return [key.replace(color, ''), value];
        });

    paletteColors[color] = Object.fromEntries(colorList);
});

const colors = Object.entries(flattenedColors).filter(
    ([key]) => !paletteColorsKeys.find(c => key.startsWith(c))
);

module.exports = {
    ...Object.fromEntries(colors),
    ...paletteColors,
};
