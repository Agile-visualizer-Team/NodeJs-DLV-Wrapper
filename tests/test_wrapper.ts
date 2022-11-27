import { assert, expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { DLVWrapper } from '../dlv_wrapper'
var child_process = require('child_process')
var fs = require('fs')

const dlvWrapper = new DLVWrapper()


//Testing parse_dlv_as() method
describe('parse_dlv_as()',  () => {
  //Parametrizing tests
  const tests = [
    {
      dlv_output: "DLV X.X.X\n\n{makeMove(7,7,2,0), sameFlowerInColumnCount(1), sameFlowerInRowCount(1)}\nCOST 9@4 8@3 2@2 2@1\nOPTIMUM", 
      expected_output: {'as': ['makeMove(7,7,2,0)','sameFlowerInColumnCount(1)','sameFlowerInRowCount(1)'],'cost': '9@4 8@3 2@2 2@1'}
    },
    {
      dlv_output: "DLV X.X.X\n\n{m(2), s(2,3)}",
      expected_output: {'as': ['m(2)', 's(2,3)'], 'cost': ''}
    },
    {
      dlv_output: "DLV X.X.X\n\nINCOHERENT",
      expected_output: {'as': [], 'cost': ''}
    }
  ];

  tests.forEach((test) =>{
    it('returns correct object representation of an AS', () => {
      //Check if for every dlv output the result matched the expected one
      let res = dlvWrapper.parse_dlv_as(test.dlv_output);
      assert.deepEqual(res, test.expected_output)
    });
  })
});

//Testing run_dlv() method
describe('run_dlv()',() =>{
  const tests = [
    {
      dlv_path: 'path_1',
      asp_file_path: 'asp_test/incoherent.asp',
    },
    {
      dlv_path: 'dlv',
      asp_file_path: 'asp_test/asptest1.asp',
    },
  ]
  tests.forEach(test => {
    it('correctly calls dlv solver', async () =>{
      let mock = sinon.mock(child_process)
      let expectation = mock.expects('execSync')

      dlvWrapper.run_dlv(test.dlv_path,test.asp_file_path,1);
      expect(expectation.calledOnce).to.be.true
      mock.restore()
    });
  });
   
  it('fails on wrong file path throwing Error', async () => {

    const test_cases = [
      {
        dlv_path : "./dlv",
        asp_file_path: "fake_asp_path"
      },
      {
        dlv_path : "fake_dlv_path",
        asp_file_path: "asp_test/flowers.asp"
      }
    ]

    test_cases.forEach((test) =>{

      assert.throws( () => {
        dlvWrapper.run_dlv(test.dlv_path, test.asp_file_path,1);
      });
    
    });
  });


  describe('write_parsed_as_to_file()', () =>{
    it('should get called with right arguments', () => {

      const test_cases = [
        {
          input : { as: [ 'm(2)', 's(2,3)' ], cost: '' },
        },
      ]

      test_cases.forEach((test) =>{
        let mocked_writefile =  sinon.mock(fs)
        let expectation = mocked_writefile.expects('writeFile')
        let spy = sinon.spy(console, 'log')
        dlvWrapper.write_parsed_as_to_file('mock_path', test.input)
        expect(expectation.getCall(0).args.includes(JSON.stringify(test.input))).to.be.true
      });

    })
  })
});