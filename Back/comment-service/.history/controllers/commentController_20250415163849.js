const fs = require('fs');
const path = require('path');

exports.addComment = (req, res) => {
  const { taskId } = req.params;
  const comment = req.body.comment;
  const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);

  fs.appendFile(filePath, comment + '\n', (err) => {
    if (err) return res.status(500).send('Erreur lors de l\'écriture');
    res.send('Commentaire ajouté');
  });
};

exports.getComments = (req, res) => {
  const { taskId } = req.params;
  const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Aucun commentaire trouvé');
  }

  const data = fs.readFileSync(filePath, 'utf8');
  res.send(data);
};
