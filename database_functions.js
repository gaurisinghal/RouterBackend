const {pool, mysql} = require('./database_config');

module.exports.add_to_queue = function add_to_queue(custId, skill){
    //select agentid, qlength from agents_iphone where skill =1 
    //insert into iphone_queues (agentid, position, custid) values(slected_agentid, qlength, custid)
    //select returns an array containing each row as an object
    let selectQuery = 'SELECT AgentId, QueueLength from agents_iphone where ?? =1';
    let query = mysql.format(selectQuery,[skill]);
    pool.query(query, (err, result)=>{
        if (err) console.log(err);
        for ( i=0; i<result.length; i++){
            let id = String(result[i].AgentId);
            let pos = String(result[i].QueueLength);
            let insertQuery = 'INSERT INTO iphone_queues (`AgentId`, `Position`, `CustomerId`) VALUES(?,?,?)';
            let newquery = mysql.format(insertQuery,[id,pos,custId]);
            pool.query(newquery,(err,result)=>{
                if (err) console.log(err);
                else console.log("Inserted");
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

module.exports.add_engagement = function toggle_engaged(agentId){
    //if changeTo == "busy", checks if agent is free and then makes them busy
    //if changeTo == "free", checks if agents is busy and then makes them free
    let selectQuery = mysql.format('SELECT AgentId, Engaged FROM agents_iphone WHERE agent_bubbleid = ?',[bubbleId]);
    pool.query(selectQuery,(err,result) => {
        if(err) console.log(err);
        else{
            let updateQuery = "UPDATE agents_iphone SET Engaged = ? WHERE AgentId = ?";
            if(result[0].Engaged ==0 && changeTo == "busy"){
                updateQuery = mysql.format(updateQuery, [1,result[0].AgentId]);
                pool.query(updateQuery, (err,result1)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to" + changeTo);
                });
            } 
            else if(result[0].Engaged == 1 && changeTo == "free"){
                updateQuery = mysql.format(updateQuery, [0,result[0].AgentId]);
                pool.query(updateQuery, (err,result2)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to" + changeTo);
                });
            }
        }
    });
}

module.exports.remove_engagement = function remove_engagement(bubbleId){
    //functions changes engaged as well as removes the bubble id from the database
    //the agent bubble id will reflect NULL even if the agent is stilll in that bubble
    let selectQuery = mysql.format('SELECT AgentId, Engaged FROM agents_iphone WHERE agent_bubbleid = ?',[bubbleId]);
    pool.query(selectQuery,(err,result) => {
        if(err) console.log(err);
        else{
            let updateQuery = "UPDATE agents_iphone SET Engaged = 0 agent_bubbleid = NULL WHERE AgentId = ?";
            if(result[0].Engaged ==1){
                updateQuery = mysql.format(updateQuery, [result[0].AgentId]);
                pool.query(updateQuery, (err,result1)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to not engaged");
                });
            } 
        }
    });
}

//toggle_availability("offline", "101fgh");
//add_to_queue('cust4','skill1');
//add_to_queue('cust1', 'skill2');
//add_to_queue('cust2', 'skill3');
//delete_from_queue('cust2');