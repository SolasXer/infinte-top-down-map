

export class Perlin {

    private static getRandom(seed: number) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    private static getPermutation() {
        const permutation = new Array<number>(512);
        const p: number[] = new Array<number>(256).fill(0).map((_, i) => i);

        let seed = 12345;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Perlin.getRandom(seed++) * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        for (let i = 0; i < 512; i++) {
            permutation[i] = p[i & 255];
        }

        return permutation;
    }

    private static fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private static lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
    }

    private static grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15;
        const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    static getNoise(x: number, y: number, z: number): number {
        const permutation = Perlin.getPermutation();
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = Perlin.fade(x);
        const v = Perlin.fade(y);
        const w = Perlin.fade(z);
        const A = permutation[X] + Y;
        const AA = permutation[A] + Z;
        const AB = permutation[A + 1] + Z;
        const B = permutation[X + 1] + Y;
        const BA = permutation[B] + Z;
        const BB = permutation[B + 1] + Z;

        const a = Perlin.lerp(
            v,
            Perlin.lerp(u, Perlin.grad(permutation[AA], x, y, z), Perlin.grad(permutation[BA], x - 1, y, z)),
            Perlin.lerp(u, Perlin.grad(permutation[AB], x, y - 1, z), Perlin.grad(permutation[BB], x - 1, y - 1, z))
        );

        const b = Perlin.lerp(
            v,
            Perlin.lerp(u, Perlin.grad(permutation[AA + 1], x, y, z - 1), Perlin.grad(permutation[BA + 1], x - 1, y, z - 1)),
            Perlin.lerp(u, Perlin.grad(permutation[AB + 1], x, y - 1, z - 1), Perlin.grad(permutation[BB + 1], x - 1, y - 1, z - 1))
        );

        return Perlin.lerp(w, a, b);
    }
}
