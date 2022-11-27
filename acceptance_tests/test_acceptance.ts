import { assert, expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { DLVWrapper } from '../dlv_wrapper'
var child_process = require('child_process')
var fs = require('fs')

//GIVEN a dlv wrapper
const dlvWrapper = new DLVWrapper()

describe('acceptance test',  () => {
    //Parametrizing tests
    it('write to stdout the correct representation of an AS', () => {
        let dlv_executable_stub = sinon.stub(dlvWrapper, "run_dlv");
        dlv_executable_stub.returns("DLV X.X.X\n\n{m(2), s(2,3)}\nCOST 1@1\n")

        let console_stub = sinon.stub(console, 'log');

        //WHEN the user execute the program using the following parameters
        let argv = {
            dlv_path: 'dlv_path',
            asp_file: 'asp_file.asp',
        }

        dlvWrapper.execute(argv);
        expect(console_stub.calledOnceWithExactly(JSON.stringify([{ 'as': [ 'm(2)', 's(2,3)' ], 'cost': '1@1' }]))).to.be.true;
        dlv_executable_stub.restore()
        console_stub.restore()
    });

    it('write to file the correct representation of an AS', () => {
        let dlv_executable_stub = sinon.stub(dlvWrapper, "run_dlv");
        dlv_executable_stub.returns("DLV X.X.X\n\n{m(2), s(2,3)}\nCOST 1@1\n")

        let file_stub = sinon.stub(fs, 'writeFile');

        //WHEN the user execute the program using the following parameters
        let argv = {
            dlv_path: 'dlv_path',
            asp_file: 'asp_file.asp',
            output: 'output.json'
        }

        dlvWrapper.execute(argv);
        expect(file_stub.calledOnce).to.be.true
        let test_res = file_stub.getCall(0).args.includes(JSON.stringify([{ 'as': [ 'm(2)', 's(2,3)' ], 'cost': '1@1' }]))
        expect(test_res).to.be.true
    });

})