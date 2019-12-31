export = Oracle;
declare class Oracle {
    constructor(context: any);
    pkg: any;
    /**
     * Tries to guess the name from package.json
     */
    guessAppName(): any;
    /**
     * Tries to guess the description from package.json
     */
    guessDescription(): any;
    /**
     * Tries to guess the version from package.json
     */
    guessVersion(): any;
    /**
     * Tries to guess the developer {name, email, url} from package.json
     */
    guessDeveloper(): any;
    /**
     * Tries to guess the developer name from package.json
     */
    guessDeveloperName(): any;
    /**
     * Tries to guess the developer URL from package.json
     */
    guessDeveloperURL(): any;
}
