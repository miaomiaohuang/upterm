import {executable, sequence, decorate, string, noisySuggestions, runtime, choice} from "../../shell/Parser";
import {expandHistoricalDirectory} from "../../Command";
import {description, styles, style, Suggestion} from "./Suggestions";
import * as _ from "lodash";
import {relativeDirectoryPath} from "./File";
import {pathIn} from "./Common";
import {PluginManager} from "../../PluginManager";

const historicalDirectory = runtime(async (context) =>
    decorate(
        choice(
            _.take(["-", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"], context.historicalCurrentDirectoriesStack.size)
                .map(alias => decorate(string(alias), description(expandHistoricalDirectory(alias, context.historicalCurrentDirectoriesStack))))
        ),
        style(styles.directory)
    )
);

const cdpathDirectory = runtime(
    async (context) => choice(context.environment.cdpath(context.directory).filter(directory => directory !== context.directory).map(directory =>
        decorate(pathIn(directory, info => info.stat.isDirectory()), description(`In ${directory}`))))
);

export const cd = sequence(decorate(executable("cd"), description("Change the working directory")), choice([
    noisySuggestions(historicalDirectory),
    noisySuggestions(cdpathDirectory),
    relativeDirectoryPath,
]));

PluginManager.registerAutocompletionProvider("cd", async(context) => {
    return _.take(["-", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"], context.historicalCurrentDirectoriesStack.size)
        .map(alias => new Suggestion().withValue(alias).withDescription(expandHistoricalDirectory(alias, context.historicalCurrentDirectoriesStack)).withStyle(styles.directory));
});
