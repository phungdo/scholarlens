const fs = require('fs');
const content = fs.readFileSync('core_rankings.js', 'utf8');
const indexContent = fs.readFileSync('index.html', 'utf8');

// evaluate the variable declarations
eval(content);

// mock the index.html function
const match = indexContent.match(/function lookupCOREConference[^\{\}]*\{[\s\S]*?\n\}/);
if (match) {
    eval(match[0]);
    console.log(lookupCOREConference("2024 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)"));
} else {
    console.log("Function not found");
}
