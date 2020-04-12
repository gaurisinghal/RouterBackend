const {pool, mysql, con} = require('./database_config');
const util = require('util');
const query = util.promisify(con.query).bind(con);

module.exports.check_for_space = async function check_for_space(category){
    var time = "Invalid";
    let query_text = "SELECT COUNT(*) as total from ??";
    if(category == "iphone"){
        try{
            const result = await query(mysql.format(query_text,["iphone_request_buffer"]));
            console.log(result);
            if (result[0].total < 10){
                time = "Ok";
            }
            else {
                time = "Long";
            }
        }catch (err){
            console.log(err);
        }
    } else if(category == "macbook"){
        try{
            const result = await query(mysql.format(query_text,["mac_request_buffer"]));
            if (result[0].total < 10){ time = "Ok";}
            else {time = "Long";}
        }catch (err){
            console.log(err);
        }
    }
    //else if category == ipad
    return String(time);
}

module.exports.add_to_queue = function add_to_queue(custId, category, skill){
    //select agentid, qlength from agents_iphone/agents_mac where skill =1 
    //insert into iphone_queues/mac_queues (agentid, position, custid) values(slected_agentid, qlength, custid)
    //select returns an array containing each row as an object
    let selectQuery = 'SELECT AgentId, QueueLength from ?? where ?? =1';
    if(category == 'iphone'){
        selectQuery = mysql.format(selectQuery,["agents_iphone", skill]);
        pool.query(mysql.format("INSERT INTO iphone_request_buffer VALUES (?)",[custId]),(err, res)=>{
            if(err) console.log(err);
        });
    }
    else if(category == 'macbook'){
        selectQuery = mysql.format(selectQuery,["agents_mac", skill]);
        pool.query(mysql.format("INSERT INTO mac_request_buffer VALUES (?)",[custId]),(err, res)=>{
            if(err) console.log(err);
        });
    }
    // else if(category == "ipad"){
    //     selectQuery = mysql.format(selectQuery,["agents_ipad",skill]);
    // }
    pool.query(selectQuery, (err, result)=>{
        if (err) console.log(err);
        for ( i=0; i<result.length; i++){
            let id = String(result[i].AgentId);
            let pos = String(result[i].QueueLength);
            let insertQuery = 'INSERT INTO ?? (`AgentId`, `Position`, `CustomerId`) VALUES(?,?,?)';
            if(category== "iphone"){
                insertQuery = mysql.format(insertQuery,["iphone_queues", id,pos,custId]);
            } else if (category == "macbook"){
                insertQuery = mysql.format(insertQuery,["mac_queues", id,pos,custId]);
            }
            pool.query(insertQuery,(err,result)=>{
                if (err) console.log(err);
                else console.log("Inserted into "+ category+" queue");
            });
        }
    }); 

}

module.exports.delete_from_queue = function delete_from_queue(custId){
    //select agentids and queue position of customer id input
    //for all these agent ids move the queue up for the items behind the given customer id ie where position> position of input 
    //after moving them up, delete the entries with custid
    let selectQuery = 'SELECT AgentId, position FROM iphone_queues WHERE CustomerId = ?';
    selectQuery = mysql.format(selectQuery,[custId])
    pool.query(selectQuery, (err,result)=>{
        if (err) console.log(err);
        else{
            for(i=0;i<result.length;i++){
                let id = String(result[i].AgentId);
                let pos = String(result[i].position);
                let updateQuery = 'UPDATE iphone_queues SET position = position-1 WHERE AgentId = ? AND position > ?';
                updateQuery = mysql.format(updateQuery,[id, pos]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("rows affected: " + result.affectedRows);
                });
            }
        }
    });
    let deleteQuery = mysql.format('DELETE FROM iphone_queues WHERE CustomerId = ?',[custId]);
    pool.query(query,(err,result) =>{
        if (err) console.log(err);
        else console.log("rows deleted: " + result.affectedRows);
    });
}

module.exports.toggle_availability = function toggle_availability(changeTo, agentId){
    let selectQuery = mysql.format('SELECT Available FROM agents_iphone WHERE AgentId = ?',[agentId]);
    pool.query(selectQuery,(err,result) => {
        if(err) console.log(err);
        else{
            let updateQuery = "UPDATE agents_iphone SET Available = ? WHERE AgentId = ?";
            if(result[0].Available ==0 && changeTo == "online"){
                updateQuery = mysql.format(updateQuery, [1,agentid]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("Agent availability updated to" + changeTo);
                });
            } 
            else if(result[0].Available == 1 && changeTo == "offline"){
                updateQuery = mysql.format(updateQuery, [0,agentid]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("Agent availablility updated to" + changeTo);
                });
            }
        }
    });
}

module.exports.add_engagement = function add_engagement(agentId, bubbleId){
    let selectQuery = mysql.format("SELECT Available, Engaged FROM agents_iphone WHERE AgentId = ?",[agentId]);
    pool.query(selectQuery,(err,result) => {
        if(err) {
            console.log(err);
        }
        else{
            //console.log("can select");
            let updateQuery = "UPDATE agents_iphone SET Engaged = 1 , agent_bubbleid = ? WHERE AgentId = ?";
            if(result[0].Engaged ==0 && result[0].Available==1){
                updateQuery = mysql.format(updateQuery, [bubbleId,agentId]);
                pool.query(updateQuery, (err,result1)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to engaged with bubbleId"+ bubbleId);
                });
            }
        }
    });
}

module.exports.remove_engagement = function remove_engagement(bubbleId){
    //functions changes engaged as well as removes the bubble id from the database
    //the agent bubble id will reflect NULL even if the agent is still in that bubble
    console.log("called");
    let selectQuery = mysql.format('SELECT AgentId, Engaged FROM agents_iphone WHERE agent_bubbleid = ?',[bubbleId]);
    pool.query(selectQuery,(err,result) => {
        if(err) console.log(err);
        else{
            let updateQuery = "UPDATE agents_iphone SET Engaged = 0 agent_bubbleid = NULL WHERE AgentId = ?";
            if(result[0].Engaged ==1){
                updateQuery = mysql.format(updateQuery, [result[0].AgentId]);
                pool.query(updateQuery, (err,result1)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to not engaged and removed from bubble"+bubbleId);
                });
            } 
        }
    });
}

//toggle_availability("offline", "101fgh");
//add_to_queue('cust4','skill1');
//add_to_queue('cust1', 'skill2');
//add_to_queue('cust2', 'skill3');
//module.exports.check_for_space("iphone");