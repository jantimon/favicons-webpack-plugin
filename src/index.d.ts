export = FaviconsWebpackPlugin;
declare class FaviconsWebpackPlugin {
    /**
     * @param {import('./options').FaviconWebpackPlugionOptions | string} args
     */
    constructor(args: string | import("./options").FaviconWebpackPlugionOptions);
    /** @type {import('./options').FaviconWebpackPlugionInternalOptions} */
    options: import('./options').FaviconWebpackPlugionInternalOptions;
    apply(compiler: any): void;
    /**
     * The light mode will only add a favicon
     * this is very fast but also very limited
     * it is the default mode for development
     */
    generateFaviconsLight(compiler: any, compilation: any): Promise<any>;
    /**
     *  The webapp mode will add a variety of icons
     * this is not as fast as the light mode but
     * supports all common browsers and devices
     */
    generateFaviconsWebapp(compiler: any, compilation: any): Promise<any>;
    /**
     * Returns wether the plugin should generate a light version or a full webapp
     */
    getCurrentCompilationMode(compiler: any): "light" | "webapp";
}
