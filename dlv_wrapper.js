"use strict";
exports.__esModule = true;
exports.DLVWrapper = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
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
    DLVWrapper.prototype.write_parsed_as_to_file = function (parsed_output) {
        (0, fs_1.writeFile)("output.json", JSON.stringify(parsed_output), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });
    };
    return DLVWrapper;
}());
exports.DLVWrapper = DLVWrapper;
function main() {
    var wrapped = new DLVWrapper();
    var res = wrapped.run_dlv('./dlv', 'asp_test/asptest1.asp');
    var parsed_as = wrapped.parse_dlv_as(res);
    wrapped.write_parsed_as_to_file([parsed_as]);
}
if (require.main === module) {
    main();
}
