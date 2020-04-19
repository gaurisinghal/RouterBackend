const assert = require("assert");
const expect = require("chai").expect;
const db = require("../database_functions");

/*
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
*/

describe('DB', function(){
  describe('check_for_space()', function(){
    it('should return "Ok" when min length< 5', async function(){
      assert.equal(await db.check_for_space('iphone','network_issues'), "Ok");
      
    })
  })
})

describe('DB', function(){
  describe('get_skills() test 1', function(){
    it('should return an array of length 3 with skill names of iphone agents', async function(){
      var result1 = await db.get_skills("agents_iphone");
      var actual = [ 'battery_issues', 'network_issues', 'crash_issues' ];
      expect(result1).to.have.lengthOf(3);
      for(i=0; i<result1.length; i++){
        expect(result1[i]).to.equal(actual[i]);
      }
    })
  })
})  

describe('DB', function(){
  describe('get_skills() test 2', function(){
    it('should return an array of length 3 with skill names of mac agents', async function(){
      var result1 = await db.get_skills("agents_mac");
      var actual = [ "screen_issues", "booting_issues", "update_issues" ];
      expect(result1).to.have.lengthOf(3);
      for(i=0; i<result1.length; i++){
        expect(result1[i]).to.equal(actual[i]);
      }
    })
  })
})
 
/* describe('DB', function(){
  describe('not_engaged_agents() test 1', function(){
    it('')
  })
})

 */

