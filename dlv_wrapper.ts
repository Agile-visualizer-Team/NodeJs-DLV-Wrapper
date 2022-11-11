
import { exec } from 'child_process';
var DLVWrapper = {
    run_dlv : (dlv_path: string, asp_file: string) : Promise<string> =>{
        return new Promise((resolve, reject) =>{
            exec(`${dlv_path} ${asp_file}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Error while running ${dlv_path} ${asp_file}\n ${error}`))
                }
                else if(stdout){
                    resolve(stdout);
                }
                else{
                    reject(new Error(stderr));
                }
            });
        });
    },
    parse_dlv_as : (dlv_output: string): object =>{
        let splitted_output = dlv_output.split('\n');
        let result_object: {[id: string] : any} = {
            'as' : [],
            'cost' : ''
        }
        splitted_output.forEach(line =>{
            let answer_set_match = line.match(/\{.*\}/);
            let answer_set_cost_match = line.match(/COST .*/);
            //if answer_set_match is null (no matched string) the ?. syntax returns undefined instead of throwing an error
            // It's usefull because we don't have to esplicitly check if there is a match in that line or not
            answer_set_match?.forEach(answer_set =>{
                result_object["as"] = answer_set.replace(/\{|\}/g, '').split(/,\s/g);
            })
            answer_set_cost_match?.forEach(answer_set_cost =>{
                result_object["cost"] = answer_set_cost.substring(5);
            })
        });
        return result_object;
    }

}
export {DLVWrapper}