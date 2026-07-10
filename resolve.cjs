const fs = require('fs');
const file = 'd:/thuctap-catspeack/catspeak-client/src/features/video-call/context/GameContext.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all merge conflicts by keeping the branch part (which is $1)
content = content.replace(/<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> feature\/picture-IT-game/g, '$1');

fs.writeFileSync(file, content);
console.log('Done');
