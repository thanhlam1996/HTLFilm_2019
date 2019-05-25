
var fs = require("fs");

var allcar = JSON.parse(fs.readFileSync("../data/movies.json", "utf-8"));
allcar.forEach(function(m) {
  var params = {   
        type : "add",
        id : m.id,
        fields : { 
            title:m.title,
            actor:m.info.actor,
            country:m.info.country,
            producer:m.info.producer
        }
  };
  fs.writeFile("../data/cloud.json", params, "UTF-8")
});
