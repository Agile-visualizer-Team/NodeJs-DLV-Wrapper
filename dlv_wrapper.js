"use strict";
exports.__esModule = true;
exports.DLVWrapper = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
function parse_args() {
    var argv = require("yargs")
        .scriptName("dlv_wrapper")
        .usage("Usage: node $0 -d dlv -i asp_file [-o output_file]")
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
        .option("n", {
        alias: "as_number",
        describe: "Number of AS you want to display, insert 0 for all",
        type: "number",
        "default": 1
    })
        .describe("help", "Show help.").argv;
    return argv;
}
var DLVWrapper = /** @class */ (function () {
    function DLVWrapper() {
    }
    DLVWrapper.prototype.run_dlv = function (dlv_path, asp_file, as_num) {
        return "" + (0, child_process_1.execSync)("".concat(dlv_path, " -n").concat(as_num, " ").concat(asp_file));
    };
    /**
     * It takes dlv output as input, splits it into lines, then for each line it checks if there's a match
     * for an answer set or an answer set cost, and if there is, it extracts the answer set or the cost and
     * puts it into the result object
     * @param {string} dlv_output - string
     * @returns an object with two properties:
     * - as: an array of strings, each string is an answer set
     * - cost: a string, the cost of the answer set
     */
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
    /**
     * It takes the path to the dlv executable and the path to the asp file, runs dlv on the asp file,
     * parses the answer set, and writes the parsed answer set to a file
     * @param {any} argv - any
     */
    DLVWrapper.prototype.execute = function (argv) {
        var _this = this;
        var res = this.run_dlv(argv.dlv_path, argv.asp_file, argv.as_number);
        var split_multiple_as = res.split(/(?<=COST \d+@\d+)/);
        var final_array = [];
        if (split_multiple_as.length == 1) {
            final_array = split_multiple_as[0].split(/\n{1}/);
        }
        else {
            final_array = [split_multiple_as[0]].concat(split_multiple_as[1].split('\n'));
            final_array.splice(2, 1);
        }
        var forDeletion = ['', 'OPTIMUM', 'DLV 2.1.1'];
        var final_output = [];
        final_array = final_array.filter(function (item) { return !forDeletion.includes(item); });
        final_array.forEach(function (element) {
            var parsed_as = _this.parse_dlv_as(element);
            final_output.push(parsed_as);
        });
        if (argv.output) {
            this.write_parsed_as_to_file(argv.output, final_output);
        }
        else {
            console.log(JSON.stringify(final_output));
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
