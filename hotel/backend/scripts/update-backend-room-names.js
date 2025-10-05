// Modifications à apporter dans vos routes manager.js

// Dans toutes les routes POST (hourly, nightly, extended), 
// remplacer les lignes comme :
// room: `CH${roomId.slice(-1)}`

// Par :
// room: room.name || `Chambre ${roomId}`

console.log('🔧 Instructions mise à jour backend [msylla01] - 2025-10-04 22:21:26');
console.log('');
console.log('Dans src/routes/manager.js, remplacer :');
console.log('❌ room: `CH${roomId.slice(-1)}`');
console.log('✅ room: room.name');
console.log('');
console.log('Dans les reçus (receipt), utiliser :');
console.log('✅ room: room.name');
console.log('✅ Cela affichera "Chambre 101", "Suite 201", etc.');
