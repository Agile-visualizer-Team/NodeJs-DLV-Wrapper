"use strict";
exports.__esModule = true;
exports.DLVWrapper = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
function parse_args() {
    var argv = require("yargs")
        .scriptName("dlv_wrapper")
        .usage("Usage: $0 -w num -h num")
        .option("d", {
        alias: "dlv_path",
        describe: "The path of the dlv solver",
        demandOption: "The dlv excutable is required.",
        type: "string"
    })
        .option("i", {
        alias: "asp_file",
        describe: "ASP file to solve",
        demandOption: "The input file is required.",
        type: "string"
    })
        .option("o", {
        alias: "output",
        describe: "path to the output file",
        type: "string"
    })
        .describe("help", "Show help.").argv;
    console.log(argv);
    return argv;
}
var DLVWrapper = /** @class */ (function () {
    function DLVWrapper() {
    }
    DLVWrapper.prototype.run_dlv = function (dlv_path, asp_file) {
        return "" + (0, child_process_1.execSync)("".concat(dlv_path, " ").concat(asp_file));
    };
    DLVWrapper.prototype.parse_dlv_as = function (dlv_output) {
        var splitted_output = dlv_output.split('\n');
        var result_object = {
            'as': [],
            'cost': ''
        };
        splitted_output.forEach(function (line) {
            var answer_set_match = line.match(/\{.*\}/);
            var answer_set_cost_match = line.match(/COST .*/);
            //if answer_set_match is null (no matched string) the ?. syntax returns undefined instead of throwing an error
            // It's usefull because we don't have to esplicitly check if there is a match in that line or not
            answer_set_match === null || answer_set_match === void 0 ? void 0 : answer_set_match.forEach(function (answer_set) {
                result_object["as"] = answer_set.replace(/\{|\}/g, '').split(/,\s/g);
            });
            answer_set_cost_match === null || answer_set_cost_match === void 0 ? void 0 : answer_set_cost_match.forEach(function (answer_set_cost) {
                result_object["cost"] = answer_set_cost.substring(5);
            });
        });
        return result_object;
    };
    DLVWrapper.prototype.write_parsed_as_to_file = function (output_file, parsed_output) {
        7;
        (0, fs_1.writeFile)(output_file, JSON.stringify(parsed_output), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
            }
            console.log("JSON file has been saved.");
        });
    };
    DLVWrapper.prototype.execute = function (argv) {
        var res = this.run_dlv(argv.dlv_path, argv.asp_file);
        var parsed_as = this.parse_dlv_as(res);
        if (argv.output) {
            this.write_parsed_as_to_file(argv.output, [parsed_as]);
        }
        else {
            console.log([parsed_as]);
        }
    };
    return DLVWrapper;
}());
exports.DLVWrapper = DLVWrapper;
function main() {
    //parsing command args
    var argv = parse_args();
    new DLVWrapper().execute(argv);
}
if (require.main === module) {
    main();
}
