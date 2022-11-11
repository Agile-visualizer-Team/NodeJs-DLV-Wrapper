"use strict";
exports.__esModule = true;
exports.DLVWrapper = void 0;
var child_process_1 = require("child_process");
var DLVWrapper = {
    run_dlv: function (dlv_path, asp_file) {
        return new Promise(function (resolve, reject) {
            (0, child_process_1.exec)("".concat(dlv_path, " ").concat(asp_file), function (error, stdout, stderr) {
                if (error) {
                    reject(new Error("Error while running ".concat(dlv_path, " ").concat(asp_file, "\n ").concat(error)));
                }
                else if (stdout) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(stderr));
                }
            });
        });
    },
    parse_dlv_as: function (dlv_output) {
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
    }
};
exports.DLVWrapper = DLVWrapper;
