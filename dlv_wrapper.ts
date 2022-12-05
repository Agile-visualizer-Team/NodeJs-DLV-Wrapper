
import { execSync } from 'child_process';
import { writeFile } from 'fs';

function parse_args(){
    var { argv } = require("yargs")
    .scriptName("dlv_wrapper")
    .usage("Usage: node $0 -d dlv -i asp_file [-o output_file]")
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
    .option("n", {
        alias: "as_number",
        describe: "Number of AS you want to display, insert 0 for all",
        type: "number",
        default: 1,
      })
    .describe("help", "Show help.")
    return argv
}
export class DLVWrapper{

    run_dlv(dlv_path: string, asp_file: string,as_num: number) {
        return "" + execSync(`${dlv_path} -n${as_num} ${asp_file}`);
    }

    /**
     * It takes dlv output as input, splits it into lines, then for each line it checks if there's a match
     * for an answer set or an answer set cost, and if there is, it extracts the answer set or the cost and
     * puts it into the result object
     * @param {string} dlv_output - string
     * @returns an object with two properties:
     * - as: an array of strings, each string is an answer set
     * - cost: a string, the cost of the answer set
     */
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

    /**
     * It takes the path to the dlv executable and the path to the asp file, runs dlv on the asp file,
     * parses the answer set, and writes the parsed answer set to a file
     * @param {any} argv - any
     */
    execute(argv: any){
        let res = this.run_dlv(argv.dlv_path,argv.asp_file,argv.as_number);
        let split_multiple_as = res.split(/(?<=COST \d+@\d+)/)
        let final_array: any = []
        if(split_multiple_as.length == 1){
            final_array = split_multiple_as[0].split(/\n{1}/)
        }
        else{
            final_array = [split_multiple_as[0]].concat(split_multiple_as[1].split('\n'))
            final_array.splice(2,1)

        }
        let forDeletion = ['','OPTIMUM','DLV 2.1.1']
        let final_output:any = []
        final_array = final_array.filter(item => !forDeletion.includes(item))
        final_array.forEach(element => {
            let parsed_as = this.parse_dlv_as(element) 
            final_output.push(parsed_as)
        });
        if (argv.output){
            this.write_parsed_as_to_file(argv.output, final_output);
        }
        else{
            console.log(JSON.stringify(final_output))
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