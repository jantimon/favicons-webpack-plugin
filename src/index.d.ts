export = FaviconsWebpackPlugin;
declare class FaviconsWebpackPlugin {
    /**
     * @param {import('./options').FaviconWebpackPlugionOptions | string} args
     */
    constructor(args: import('./options').FaviconWebpackPlugionOptions | string);
    /**
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler: import('webpack').Compiler): void;
    #private;
}
