/**
 * Creates a 32-bit ABGR color based on just the 0-255 RGB values.
 * @param {number} r red component, 0-255
 * @param {number} g green component, 0-255
 * @param {number} b blue component, 0-255
 * @returns {number} a 32-bit ABGR value
 */
function rgb(r, g, b) {
    return 0xFF000000 | (b << 16) | (g << 8) | r;
}

ProcGen = function(textureWidth, textureHeight) {

    return {
        simplexNoise: simplexNoise,

        makeRGBMap: makeRGB,
        makeFloatMap: makeFloat,
        makeIntMap: makeInt
    };

    function simplexNoise(seed, octaveCount, roughness) {
        var octaveNoise = SimplexNoise.makeOctaveSphericalNoise(seed, octaveCount, roughness);
        var buffer = Buffers.float(textureWidth, textureHeight);

        var noiseX = 0.0, noiseY = 0.0, noiseStepX = Math.PI * 2 / textureWidth, noiseStepY = Math.PI / textureHeight;
        var endLoc = textureWidth * textureHeight;
        var targetArray = buffer.array;
        for (var loc = 0; loc < endLoc;) {
            targetArray[loc++] = octaveNoise(noiseX, noiseY);
            if (loc % textureWidth) {
                noiseX += noiseStepX;
            } else {
                noiseY += noiseStepY;
                noiseX = 0.0;
            }
        }
        return buffer;
    }

    function makeRGB(sources, fn) {
        return derivedBuffer(sources, Buffers.rgb(textureWidth, textureHeight), fn);
    }

    function makeFloat(sources, fn) {
        return derivedBuffer(sources, Buffers.float(textureWidth, textureHeight), fn);
    }

    function makeInt(sources, fn) {
        return derivedBuffer(sources, Buffers.int(textureWidth, textureHeight), fn);
    }

    function derivedBuffer(sources, target, fn) {
        var args = new Array(sources.length + 2), sourceCount = sources.length,
            xIndex = sources.length, yIndex = sources.length + 1;

        var sourceArrays = sources.map(function(source) {
            return source.array;
        });

        var targetArray = target.array;
        var wrapX = textureWidth;
        var endLoc = textureWidth * textureHeight;
        args[xIndex] = 0; args[yIndex] = 0;

        for (var loc = 0; loc != endLoc; loc++) {
            for (var i = 0; i < sourceCount; i++)
                args[i] = sourceArrays[i][loc];
            args[xIndex]++;
            if (args[xIndex] == wrapX) {
                args[xIndex] = 0;
                args[yIndex]++;
            }
            targetArray[loc] = fn.apply(null, args);
        }

        return target;
    }


};
