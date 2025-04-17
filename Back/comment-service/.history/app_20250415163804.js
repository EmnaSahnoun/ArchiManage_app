const express = require('express');
const app = express();
const commentRoutes = require('./routes/commentRoutes');

app.use(express.json());
app.use('/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});
