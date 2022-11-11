import { assert, expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { DLVWrapper } from '../dlv_wrapper'
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
      let res = DLVWrapper.parse_dlv_as(test.dlv_output);
      assert.deepEqual(res, test.expected_output)
    });
  })
});

describe('run_dlv()',() =>{
  const tests = [
    {
      dlv_path: './dlv',
      asp_file_path: 'asp_test/incoherent.asp',
      expected_output: 'DLV 2.1.1\n\nINCOHERENT\n'
    },
    {
      dlv_path: './dlv',
      asp_file_path: 'asp_test/asptest1.asp',
      expected_output: 'DLV 2.1.1\n\n{m(2), s(2,3)}\n'
    },
    {
      dlv_path: './dlv',
      asp_file_path: 'asp_test/flowers.asp',
      expected_output: 'DLV 2.1.1\n\n{makeMove(7,7,2,0), sameFlowerInColumnCount(1), sameFlowerInRowCount(1)}\nCOST 9@4 8@3 2@2 2@1\nOPTIMUM\n'
    },
  ]
  tests.forEach(test => {
    it('correctly wraps dlv solver', async () =>{
      let res = await DLVWrapper.run_dlv(test.dlv_path,test.asp_file_path);
      assert.deepEqual(res, test.expected_output);
    });
  });

  it('fails on wrong dlv solver path throwing Error',async () => {
    try {
      await DLVWrapper.run_dlv('./dddlv','asp_test/flowers.asp');
    } catch (error: any) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.be.equals("Error while running ./dddlv asp_test/flowers.asp\n Error: Command failed: ./dddlv asp_test/flowers.asp\n/bin/sh: 1: ./dddlv: not found\n")
    }   
  })

  it('fails on wrong asp file path throwing Error', async () => {
    try {
      await DLVWrapper.run_dlv('./dlv','asp_test/flowerS.asp');
    } catch (error: any) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.be.equals("Error while running ./dlv asp_test/flowerS.asp\n Error: Command failed: ./dlv asp_test/flowerS.asp\nline 0: Can't open input.\n")
    }
  });
  it('fails on wrong syntax in asp file throwing Error', async () => {
    try {
      await DLVWrapper.run_dlv('./dlv','asp_test/wrong_syntax.asp');
    } catch (error: any) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.be.equals("Error while running ./dlv asp_test/wrong_syntax.asp\n Error: Command failed: ./dlv asp_test/wrong_syntax.asp\nasp_test/wrong_syntax.asp: line 1: syntax error, unexpected $end.\nAborting due to parser errors.\n")
    }
  })

});