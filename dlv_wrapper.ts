
import { execSync } from 'child_process';
import { writeFile } from 'fs';

export class DLVWrapper{

    run_dlv(dlv_path: string, asp_file: string) {
        return "" + execSync(`${dlv_path} ${asp_file}`);
    }

    parse_dlv_as(dlv_output: string){
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

    write_parsed_as_to_file(parsed_output){
        writeFile("output.json", JSON.stringify(parsed_output), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
         
            console.log("JSON file has been saved.");
        });
    }
}

function main(){
    let wrapped = new DLVWrapper()
    let res = wrapped.run_dlv('./dlv', 'asp_test/asptest1.asp');
    let parsed_as = wrapped.parse_dlv_as(res)
    wrapped.write_parsed_as_to_file([parsed_as]);
}


if (require.main === module) {
    main();
}