
import { execSync } from 'child_process';
import { writeFile } from 'fs';

function parse_args(){
    var { argv } = require("yargs")
    .scriptName("dlv_wrapper")
    .usage("Usage: $0 -w num -h num")
    .option("d", {
      alias: "dlv_path",
      describe: "The path of the dlv solver",
      demandOption: "The dlv excutable is required.",
      type: "string",
    })
    .option("i", {
      alias: "asp_file",
      describe: "ASP file to solve",
      demandOption: "The input file is required.",
      type: "string",
    })
    .option("o", {
      alias: "output",
      describe: "path to the output file",
      type: "string",
    })
    .describe("help", "Show help.")
    console.log(argv)
    return argv
}
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

    write_parsed_as_to_file(output_file: string, parsed_output : object){7
        writeFile(output_file, JSON.stringify(parsed_output), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
            }
         
            console.log("JSON file has been saved.");
        });
    }

    execute(argv: any){
        let res = this.run_dlv(argv.dlv_path,argv.asp_file);
        let parsed_as = this.parse_dlv_as(res)
        if (argv.output){
            this.write_parsed_as_to_file(argv.output, [parsed_as]);
        }
        else{
            console.log([parsed_as])
        }
    }
}

function main(){
    //parsing command args
    let argv = parse_args();
    new DLVWrapper().execute(argv)
}


if (require.main === module) {
    main();
}