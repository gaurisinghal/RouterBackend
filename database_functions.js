const {pool, mysql, con} = require('./database_config');
const util = require('util');
const query = util.promisify(con.query).bind(con);

module.exports.check_for_space = async function check_for_space(category, skill){
    let time = "Invalid";
    //let query_text = "SELECT COUNT(*) as total from ??";
    let query_text = "SELECT MIN(QueueLength) as minimum from ?? WHERE ?? =1 AND Available = 1"
    if(category == "iphone"){
        try{
            //const num_requests = await query(mysql.format(query_text,["iphone_request_buffer"]));
            //const num_available_agents = await query("SELECT COUNT(*) AS total from agents_iphone WHERE Available =1");
            const queue_length = await query(mysql.format(query_text,["agents_iphone", skill]));
            //if (num_requests[0].total< num_available_agents[0].total*3){ time = "Ok"; }
            if(queue_length.length != 0 && queue_length[0].minimum <5){time = "Ok";}
            else { time = "Long";}
        }catch (err){
            console.log(err);
        }
    } else if(category == "macbook"){
        try{
            //const num_requests = await query(mysql.format(query_text,["mac_request_buffer"]));
            //const num_available_agents = await query("SELECT COUNT(*) AS total from agents_mac WHERE Available =1");
            const queue_length = await query(mysql.format(query_text,["agents_mac", skill]));
            //if (num_requests[0].total< num_available_agents[0].total*3){ time = "Ok"; }
            if(queue_length.length != 0 && queue_length[0].minimum <5){time = "Ok";}
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
            if(category== "iphone"){ insertQuery = mysql.format(insertQuery,["iphone_queues", id,pos,custId]);}
            else if (category == "macbook"){ insertQuery = mysql.format(insertQuery,["mac_queues", id,pos,custId]);}

            pool.query(insertQuery,(err,result)=>{
                if (err) console.log(err);
                else console.log("Inserted into "+ category+" queue");
            });
        }
    }); 

}

module.exports.delete_from_queue = async function delete_from_queue(custId, category_queues){
    //category should be either "iphone_queues" or "mac_queues" so that code is cleaner and more flexible and extendable
    //select agentids and queue position of customer id input
    //for all these agent ids move the queue up for the items behind the given customer id ie where position> position of input 
    //after moving them up, delete the entries with custid
    //delete the corresponding entry from request buffer as well
    let selectQuery = 'SELECT AgentId, position FROM ?? WHERE CustomerId = ?';
    selectQuery = mysql.format(selectQuery, [category_queues, custId]);
    try{
        result = await query(selectQuery);
        for(i=0;i<result.length;i++){
            let id = String(result[i].AgentId);
            let pos = String(result[i].position);

            let updateQuery = 'UPDATE ?? SET position = position-1 WHERE AgentId = ? AND position > ?';
            updateQuery = mysql.format(updateQuery,[category_queues, id, pos]);
            
            try{
                result1 = await query(updateQuery);
                console.log("rows affected: " + result1.affectedRows);
            } catch(err){ console.log(err);}
        }
    }catch(err){console.log(err);}

    let deleteQuery = 'DELETE FROM ?? WHERE CustomerId = ?';
    deleteQuery = mysql.format(deleteQuery,[category_queues, custId]);
    pool.query(deleteQuery,(err,result) =>{
        if (err) console.log(err);
        else console.log("rows deleted: " + result.affectedRows);
    });
    let deleteQuery1 = "DELETE FROM ?? WHERE custId = ?";
    if(category_queues == "iphone_queues"){
        deleteQuery1 = mysql.format(deleteQuery1,["iphone_request_buffer",custId]);
    }
    else if(category_queues == "mac_queues"){
        deleteQuery1 = mysql.format(deleteQuery1,["mac_request_buffer",custId]);
    }
    pool.query(deleteQuery1, (err,res)=>{
        if(err) console.log(err);
        else console.log("buffer updated");
    })
}

module.exports.toggle_availability = function toggle_availability(changeTo, agentId, agents_category){
    //category should be "agents_iphone" or "agents_mac" for readable and more fexible/extendible code
    let selectQuery = 'SELECT Available FROM ?? WHERE AgentId = ?';
    selectQuery = mysql.format(selectQuery,[agents_category, agentId]);

    pool.query(selectQuery,(err,result) => {
        if(err) console.log(err);
        else{
            let updateQuery = "UPDATE ?? SET Available = ? WHERE AgentId = ?";
            if(result[0].Available ==0 && changeTo == "online"){
                updateQuery = mysql.format(updateQuery, [agents_category, 1, agentid]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("Iphone agent availability updated to" + changeTo);
                });
            } 
            else if(result[0].Available == 1 && changeTo == "offline"){
                updateQuery = mysql.format(updateQuery, [agents_category, 0, agentid]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("Mac agent availablility updated to" + changeTo);
                });
            }
        }
    });
}

module.exports.add_engagement = function add_engagement(agentId, bubbleId, agents_category){
    //agents_category = "agents_iphone" or "agents_mac" etc
    let selectQuery = mysql.format("SELECT Available, Engaged FROM ?? WHERE AgentId = ?",[agents_category, agentId]);
    pool.query(selectQuery,(err,result) => {
        if(err) {
            console.log(err);
        }
        else{
            //console.log("can select");
            let updateQuery = "UPDATE ?? SET Engaged = 1 , agent_bubbleid = ? WHERE AgentId = ?";
            if(result[0].Engaged ==0 && result[0].Available==1){
                updateQuery = mysql.format(updateQuery, [agents_category, bubbleId, agentId]);
                pool.query(updateQuery, (err,result1)=>{
                    if(err) console.log(err);
                    else console.log("Agent status updated to engaged with bubbleId"+ bubbleId);
                });
            }
        }
    });
    pool.query(mysql.format("INSERT INTO engagement_tracker VALUES(?,?)",[agents_category,bubbleId]),(err)=>{
        if(err) console.log(err);
    });
}

module.exports.remove_engagement = async function remove_engagement(bubbleId){
    //functions changes engaged as well as removes the bubble id from the database
    //the agent bubble id will reflect NULL even if the agent is still in that bubble
    let query_text = mysql.format("SELECT Agents_category from engagement_tracker WHERE agent_bubbleid = ?", [bubbleId]);
    try{
        const res = await query(query_text);
        let selectQuery = mysql.format('SELECT AgentId, Engaged FROM ?? WHERE agent_bubbleid = ?',[res[0].Agents_category, bubbleId]);
        try{
            const res1 = await query(selectQuery);
            let updateQuery = "UPDATE ?? SET Engaged = 0, agent_bubbleid = NULL WHERE AgentId = ?";
            if(res1[0].Engaged ==1){
                updateQuery = mysql.format(updateQuery, [res[0].Agents_category, res1[0].AgentId]);
                try{
                    const res2 = await query(updateQuery);
                    console.log("Agent status updated to not engaged and removed from bubble "+bubbleId);
                } catch(err) {console.log(err);}
            } 
        } catch(err){console.log(err);}
    } catch(err){console.log(err);}
}

module.exports.notengaged_agents = async function notengaged_agents(){
    //check if the request buffer is not empty. if not empty:
    //check the table of that category for not engaged agents. if none, return null
    //if engaged =1, return that agentId from that table and bubbleId of position=0 from the respective queues table
   let result = null;
   try{
        const res = await query("SELECT COUNT(*) AS total FROM `iphone_request_buffer`");
        if(res[0].total !=0){
            try{
                const res1 = await query("SELECT AgentId FROM agents_iphone WHERE Engaged =0 AND QueueLength !=0");
                if(res1.length != 0){
                    if(result == null){result=[];}
                    for(i = 0; i< res1.length; i++){
                        try{
                            let selectQuery ="SELECT CustomerId FROM iphone_queues WHERE AgentId = ? AND Position = 0";
                            const res2 = await query(mysql.format(selectQuery,[res1[i].AgentId]));
                            result.push(res1[i].AgentId);
                            result.push(res2[0].CustomerId);
                            result.push("agents_iphone");
                            this.delete_from_queue(res2[0].CustomerId, "iphone_queues");
                        } catch(err){ console.log(err);}
                    }
                }
            } catch(err){ console.log(err);}
        }
    } catch(err){ console.log(err);}
    
    try{
        const res = await query("SELECT COUNT(*) AS total FROM `mac_request_buffer`");
        if(res[0].total !=0){
            try{
                const res1 = await query("SELECT AgentId FROM agents_mac where Engaged =0");
                if(res1.length != 0){
                    if(result == null){ result = [];}
                    for(i = 0; i< res1.length; i++){
                        try{
                            let selectQuery ="SELECT CustomerId FROM mac_queues WHERE AgentId = ? AND Position = 0";
                            const res2 = await query(mysql.format(selectQuery,[res1[i].AgentId]));
                            result.push(res1[i].AgentId);
                            result.push(res2[0].CustomerId);
                            result.push("agents_mac");
                            this.delete_from_queue(res2[0].CustomerId, "mac_queues");
                        } catch(err){ console.log(err);}
                    }
                }
            } catch(err){ console.log(err);}
        }
    } catch(err){ console.log(err);}


    console.log(result);
    return result;
}

//toggle_availability("offline", "101fgh");
//add_to_queue('cust4','skill1');
//add_to_queue('cust1', 'skill2');
//add_to_queue('cust2', 'skill3');
//module.exports.notengaged_agents();
