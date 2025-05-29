require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('GET  /auth/google');
  console.log('GET  /auth/google/callback');
  console.log('POST /send-email');
  console.log('GET  /sent-emails');
  console.log('GET  /drafts');
  console.log('GET  /check-email-read/:emailId');
  console.log('POST /refresh-token');
});