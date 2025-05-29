const multer = require('multer');
const storage = multer.memoryStorage(); // Stocke les fichiers en mémoire sous forme de Buffer
const upload = multer({ storage: storage });

module.exports = upload;